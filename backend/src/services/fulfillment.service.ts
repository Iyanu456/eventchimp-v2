import mongoose from "mongoose";
import { EventModel } from "../models/Event";
import { OrderModel } from "../models/Order";
import { TicketModel } from "../models/Ticket";
import { UserModel } from "../models/User";
import { AppError } from "../utils/app-error";
import { buildTicketVerificationUrl, generateQrCode, generateQrToken, hashQrToken } from "../utils/qr";

const isRecoverableFulfillmentError = (error: unknown) => {
  if (error && typeof error === "object") {
    const candidate = error as { code?: number; errorLabels?: string[] };
    if (candidate.code === 11000) {
      return true;
    }

    if (candidate.errorLabels?.includes("TransientTransactionError")) {
      return true;
    }
  }

  return false;
};

export const fulfillOrderTickets = async (orderId: string) => {
  const session = await mongoose.startSession();

  try {
    let createdTicketIds: string[] = [];

    try {
      await session.withTransaction(async () => {
        const order = await OrderModel.findById(orderId).session(session);
        if (!order) {
          throw new AppError("Order not found for fulfillment", 404);
        }

        if (order.fulfillmentStatus === "fulfilled" && order.ticketIds.length) {
          createdTicketIds = order.ticketIds.map((ticketId) => ticketId.toString());
          return;
        }

        const event = await EventModel.findById(order.eventId).session(session);
        if (!event) {
          throw new AppError("Event not found for fulfillment", 404);
        }

        const existingTickets = await TicketModel.find({ orderId: order._id }).session(session);
        const purchaser = order.purchaserId ? await UserModel.findById(order.purchaserId).session(session) : null;
        const ticketsToCreate = Math.max(order.quantity - existingTickets.length, 0);

        const newlyCreatedTickets = [];
        for (let index = existingTickets.length; index < existingTickets.length + ticketsToCreate; index += 1) {
          const ticketSequence = index + 1;
          const paymentReference = `${order.providerReference}-${ticketSequence}`;
          const ticketCode = `EC-${order.providerReference.replace(/[^a-z0-9]/gi, "").toUpperCase()}-${String(ticketSequence).padStart(2, "0")}`;
          const qrToken = generateQrToken();
          const qrCode = await generateQrCode(buildTicketVerificationUrl(qrToken));

          const created = await TicketModel.create(
            [
              {
                eventId: event._id,
                orderId: order._id,
                ticketSequence,
                purchaserId: purchaser?._id ?? null,
                paymentReference,
                paymentStatus: "success",
                status: "issued",
                ticketCode,
                qrTokenHash: hashQrToken(qrToken),
                qrCode,
                totalPaid: order.pricing.buyerTotal / order.quantity,
                ticketPrice: order.pricing.ticketSubtotal / order.quantity,
                serviceFee: order.pricing.serviceFee / order.quantity,
                ticketTypeId: order.ticketTypeId,
                ticketTypeName: order.ticketTypeName,
                attendeeFirstName: order.attendeeFirstName,
                attendeeLastName: order.attendeeLastName,
                attendeeEmail: order.attendeeEmail,
                attendeePhone: order.attendeePhone,
                orderReference: order.providerReference,
                customAnswers: order.customAnswers,
                comment: order.comment
              }
            ],
            { session }
          );

          newlyCreatedTickets.push(created[0]);
        }

        const allTickets = [...existingTickets, ...newlyCreatedTickets];
        const alreadyCounted = order.ticketIds.length ? order.ticketIds.length : existingTickets.length;
        const delta = Math.max(allTickets.length - alreadyCounted, 0);

        order.ticketIds = allTickets.map((ticket) => ticket._id) as never;
        order.fulfillmentStatus = "fulfilled";
        await order.save({ session });

        if (delta > 0) {
          event.attendeesCount += delta;
          if (event.attendeesCount >= event.capacity) {
            event.status = "sold_out";
          }
          await event.save({ session });
        }

        createdTicketIds = allTickets.map((ticket) => ticket._id.toString());
      });
    } catch (error) {
      if (!isRecoverableFulfillmentError(error)) {
        throw error;
      }

      const recoveredOrder = await OrderModel.findById(orderId);
      const recoveredTickets = await TicketModel.find({ orderId }).populate("eventId");
      if (recoveredOrder && (recoveredOrder.fulfillmentStatus === "fulfilled" || recoveredTickets.length >= recoveredOrder.quantity)) {
        return recoveredTickets;
      }

      throw error;
    }

    return TicketModel.find({ _id: { $in: createdTicketIds } }).populate("eventId");
  } finally {
    await session.endSession();
  }
};
