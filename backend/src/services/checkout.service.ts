import { EventModel } from "../models/Event";
import { TicketModel } from "../models/Ticket";
import { TransactionModel } from "../models/Transaction";
import { UserModel } from "../models/User";
import { AppError } from "../utils/app-error";
import { calculatePricing } from "../utils/pricing";
import { generateQrCode } from "../utils/qr";
import { sendTicketConfirmationEmail } from "./email.service";
import { initializePaystackPayment, verifyPaystackPayment } from "./paystack.service";

const buildReference = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const initializeCheckout = async (eventId: string, user: Express.User) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.status !== "published") {
    throw new AppError("Only published events can accept ticket purchases", 400);
  }

  if (event.capacity <= event.attendeesCount) {
    throw new AppError("This event is sold out", 400);
  }

  const pricing = calculatePricing(event.isFree ? 0 : event.ticketPrice);
  const reference = buildReference();

  await TransactionModel.create({
    eventId: event._id,
    organizerId: event.organizerId,
    purchaserId: user.id,
    providerReference: reference,
    amount: pricing.totalPaid,
    ticketPrice: pricing.ticketPrice,
    serviceFee: pricing.serviceFee,
    organizerShare: pricing.organizerShare,
    platformRevenue: pricing.platformRevenue,
    status: pricing.totalPaid === 0 ? "success" : "pending"
  });

  const payment = await initializePaystackPayment({
    email: user.email,
    amount: pricing.totalPaid,
    reference,
    metadata: {
      eventId: event._id.toString(),
      userId: user.id
    }
  });

  return {
    reference,
    checkoutUrl: payment.authorizationUrl,
    mode: payment.mode,
    pricing
  };
};

export const verifyCheckout = async (reference: string) => {
  const transaction = await TransactionModel.findOne({ providerReference: reference });
  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.ticketId && transaction.status === "success") {
    const existingTicket = await TicketModel.findById(transaction.ticketId).populate("eventId");
    return { transaction, ticket: existingTicket };
  }

  const verification =
    transaction.amount === 0
      ? { status: true, data: { status: "success" } }
      : await verifyPaystackPayment(reference);

  if (!verification.status || verification.data.status !== "success") {
    transaction.status = "failed";
    await transaction.save();
    throw new AppError("Payment verification failed", 400);
  }

  const event = await EventModel.findById(transaction.eventId);
  const purchaser = await UserModel.findById(transaction.purchaserId);
  if (!event || !purchaser) {
    throw new AppError("Payment references invalid data", 500);
  }

  const qrCode = await generateQrCode(
    JSON.stringify({
      ticketReference: transaction.providerReference,
      eventId: event._id.toString(),
      purchaserId: purchaser._id.toString()
    })
  );

  const ticket = await TicketModel.create({
    eventId: event._id,
    purchaserId: purchaser._id,
    paymentReference: transaction.providerReference,
    paymentStatus: "success",
    qrCode,
    totalPaid: transaction.amount,
    ticketPrice: transaction.ticketPrice,
    serviceFee: transaction.serviceFee
  });

  transaction.status = "success";
  transaction.ticketId = ticket._id;
  await transaction.save();

  event.attendeesCount += 1;
  if (event.attendeesCount >= event.capacity) {
    event.status = "sold_out";
  }
  await event.save();

  await sendTicketConfirmationEmail({
    to: purchaser.email,
    name: purchaser.name,
    eventTitle: event.title,
    amount: transaction.amount,
    qrCode
  });

  return { transaction, ticket };
};
