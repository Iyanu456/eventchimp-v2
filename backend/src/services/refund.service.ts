import { OrderModel } from "../models/Order";
import { RefundModel } from "../models/Refund";
import { TicketModel } from "../models/Ticket";
import { AppError } from "../utils/app-error";
import { createPaystackRefund } from "./paystack.service";
import { recordRefundLedgerEntry } from "./ledger.service";

type CreateRefundInput = {
  orderReference: string;
  amount?: number;
  reason?: string;
  customerNote?: string;
  merchantNote?: string;
  includeServiceFee?: boolean;
};

const assertRefundAccess = (actor: Express.User, organizerId: string) => {
  if (actor.role === "admin") {
    return;
  }

  if (actor.role !== "organizer" || actor.id !== organizerId) {
    throw new AppError("You cannot refund this order", 403);
  }
};

export const createRefund = async (actor: Express.User, input: CreateRefundInput) => {
  const order = await OrderModel.findOne({
    $or: [{ providerReference: input.orderReference }, { publicReference: input.orderReference }]
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  assertRefundAccess(actor, String(order.organizerId));

  if (order.paymentStatus !== "paid") {
    throw new AppError("Only paid orders can be refunded", 400);
  }

  const tickets = await TicketModel.find({ orderId: order._id });
  if (tickets.some((ticket) => ticket.checkedIn)) {
    throw new AppError("Checked-in tickets cannot be refunded", 400);
  }

  const refundableAmount = input.includeServiceFee
    ? order.pricing.buyerTotal - order.refundedAmount
    : order.pricing.ticketSubtotal - order.refundedAmount;

  if (refundableAmount <= 0) {
    throw new AppError("This order has no refundable balance left", 400);
  }

  const amount = Math.min(input.amount ?? refundableAmount, refundableAmount);
  const refund = await RefundModel.create({
    orderId: order._id,
    eventId: order.eventId,
    organizerId: order.organizerId,
    initiatedByUserId: actor.id,
    amount,
    includeServiceFee: Boolean(input.includeServiceFee),
    status: "processing",
    reason: input.reason ?? "",
    merchantNote: input.merchantNote ?? ""
  });

  const paystackRefund = await createPaystackRefund({
    transactionReference: order.providerReference,
    amount,
    currency: order.currency,
    customerNote: input.customerNote,
    merchantNote: input.merchantNote
  });

  refund.status = "succeeded";
  refund.paystackRefundId = paystackRefund.id;
  refund.paystackRefundStatus = paystackRefund.status;
  refund.processedAt = new Date();
  await refund.save();

  order.refundedAmount += amount;
  if (order.refundedAmount >= (input.includeServiceFee ? order.pricing.buyerTotal : order.pricing.ticketSubtotal)) {
    order.paymentStatus = "refunded";
    order.fulfillmentStatus = "refunded";
    order.settlementStatus = "refunded";
    if (input.includeServiceFee) {
      order.serviceFeeRefunded = true;
    }

      await TicketModel.updateMany(
        { orderId: order._id },
        { $set: { paymentStatus: "refunded", status: "refunded" } }
      );
  }

  await order.save();
  await recordRefundLedgerEntry(order, amount, input.reason ?? "Order refunded");

  return refund;
};
