import crypto from "crypto";
import { OrderModel } from "../models/Order";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { TicketModel } from "../models/Ticket";
import { WebhookLogModel } from "../models/WebhookLog";
import { EventModel } from "../models/Event";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { calculatePricingBreakdown } from "../utils/pricing";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
  verifyWebhookSignature
} from "./paystack.service";
import { recordPaymentLedgerEntries } from "./ledger.service";
import { fulfillOrderTickets } from "./fulfillment.service";
import { enqueueJob } from "./job-queue.service";
import { reconcileOrder } from "./reconciliation.service";
import { sendTicketConfirmationEmail } from "./email.service";
import { serializeOrderToTransactionView } from "./payment-view.service";

type CheckoutAnswerInput = {
  fieldId: string;
  label: string;
  value: string;
};

export type CheckoutInput = {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  comment?: string;
  customAnswers?: CheckoutAnswerInput[];
};

export type PaymentQuoteInput = Pick<CheckoutInput, "eventId" | "ticketTypeId" | "quantity">;

const buildReference = () => `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const sanitizeAnswers = (answers: CheckoutAnswerInput[] = []) =>
  answers
    .map((answer) => ({
      fieldId: answer.fieldId,
      label: answer.label.trim(),
      value: answer.value.trim()
    }))
    .filter((answer) => answer.fieldId && answer.label && answer.value);

const getTierSoldCount = async (eventId: string, ticketTypeId: string) => {
  const paidOrders = await OrderModel.find({
    eventId,
    ticketTypeId,
    paymentStatus: { $in: ["paid", "refunded"] }
  }).select("quantity refundedAmount pricing.ticketSubtotal");

  return paidOrders.reduce((sum, order) => {
    const fullyRefunded = order.paymentStatus === "refunded" && order.refundedAmount >= order.pricing.ticketSubtotal;
    return fullyRefunded ? sum : sum + order.quantity;
  }, 0);
};

const loadCheckoutContext = async (input: PaymentQuoteInput) => {
  const event = await EventModel.findById(input.eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.status !== "published") {
    throw new AppError("Only published events can accept ticket purchases", 400);
  }

  if (event.accessStatus !== "active" || event.riskStatus === "blocked") {
    throw new AppError("This event is not currently accepting payments", 403);
  }

  const selectedTier = event.ticketTiers.find((tier) => tier.id === input.ticketTypeId);
  if (!selectedTier) {
    throw new AppError("Ticket type not found", 404);
  }

  const soldCount = await getTierSoldCount(String(event._id), input.ticketTypeId);
  const availableTierQuantity = Math.max(selectedTier.quantity - soldCount, 0);
  if (availableTierQuantity < input.quantity) {
    throw new AppError("This ticket tier no longer has enough seats available", 400);
  }

  if (event.capacity < event.attendeesCount + input.quantity) {
    throw new AppError("This event no longer has that many spots left", 400);
  }

  if (selectedTier.price > 0 && !event.payoutReady) {
    throw new AppError("The organizer must complete payout setup before selling paid tickets", 400);
  }

  const organizerProfile =
    selectedTier.price > 0 ? await OrganizerProfileModel.findOne({ userId: event.organizerId }) : null;

  if (selectedTier.price > 0 && (!organizerProfile?.payoutReady || !organizerProfile.payoutProfile.subaccountCode)) {
    throw new AppError("This organizer is not ready to receive paid event settlements", 400);
  }

  return {
    event,
    selectedTier,
    organizerProfile
  };
};

export const getPaymentQuote = async (input: PaymentQuoteInput) => {
  const { selectedTier } = await loadCheckoutContext(input);
  return calculatePricingBreakdown(selectedTier.price * input.quantity, "split_subaccount");
};

const validateCustomAnswers = (
  event:
    | {
        customFields: Array<{
          id: string;
          label: string;
          required: boolean;
          type: string;
          options: string[];
        }>;
      }
    | null,
  answers: CheckoutAnswerInput[]
) => {
  if (!event) {
    return;
  }

  const byId = new Map(event.customFields.map((field) => [field.id, field]));

  event.customFields.forEach((field) => {
    if (field.required && !answers.some((answer) => answer.fieldId === field.id && answer.value.trim())) {
      throw new AppError(`A required attendee field is missing: ${field.label}`, 400);
    }
  });

  answers.forEach((answer) => {
    const field = byId.get(answer.fieldId);
    if (!field) {
      throw new AppError(`Invalid attendee field submitted: ${answer.label}`, 400);
    }

    if (field.type === "select" && field.options.length && !field.options.includes(answer.value)) {
      throw new AppError(`Invalid option selected for ${field.label}`, 400);
    }
  });
};

export const initializeOrderCheckout = async (input: CheckoutInput, user?: Express.User) => {
  const { event, selectedTier, organizerProfile } = await loadCheckoutContext(input);
  const pricing = calculatePricingBreakdown(selectedTier.price * input.quantity, "split_subaccount");
  const reference = buildReference();
  const answers = sanitizeAnswers(input.customAnswers);
  validateCustomAnswers(event, answers);

  const order = await OrderModel.create({
    publicReference: reference,
    providerReference: reference,
    currency: "NGN",
    eventId: event._id,
    organizerId: event.organizerId,
    purchaserId: user?.id ?? null,
    attendeeFirstName: input.attendeeFirstName.trim(),
    attendeeLastName: input.attendeeLastName.trim(),
    attendeeEmail: input.attendeeEmail.trim(),
    attendeePhone: input.attendeePhone?.trim() ?? "",
    comment: input.comment?.trim() ?? "",
    customAnswers: answers,
    ticketTypeId: selectedTier.id,
    ticketTypeName: selectedTier.name,
    quantity: input.quantity,
    pricing,
    paymentStatus: pricing.buyerTotal === 0 ? "paid" : "pending",
    fulfillmentStatus: "pending",
    settlementStatus: "pending",
    paystack: {
      subaccountCode: organizerProfile?.payoutProfile.subaccountCode ?? "",
      transactionCharge: pricing.serviceFee,
      bearer: "account"
    }
  });

  if (pricing.buyerTotal === 0) {
    return {
      reference,
      checkoutUrl: "",
      mode: "mock" as const,
      pricing,
      ticketType: {
        id: selectedTier.id,
        name: selectedTier.name,
        quantity: input.quantity
      }
    };
  }

  const payment = await initializePaystackPayment({
    email: input.attendeeEmail.trim(),
    amount: pricing.buyerTotal,
    reference,
    callbackUrl: `${env.CLIENT_URL}/events/${event.slug}/checkout?reference=${reference}`,
    metadata: {
      orderId: order._id.toString(),
      eventId: event._id.toString(),
      ticketTypeId: selectedTier.id,
      quantity: input.quantity
    },
    subaccountCode: organizerProfile?.payoutProfile.subaccountCode ?? "",
    transactionCharge: pricing.serviceFee,
    bearer: "account"
  });

  order.paystack = {
    ...order.paystack,
    accessCode: payment.accessCode,
    authorizationUrl: payment.authorizationUrl
  } as never;
  await order.save();

  return {
    reference,
    checkoutUrl: payment.authorizationUrl,
    mode: payment.mode,
    pricing,
    ticketType: {
      id: selectedTier.id,
      name: selectedTier.name,
      quantity: input.quantity
    }
  };
};

const finalizeOrder = async (orderId: string) => {
  const tickets = await fulfillOrderTickets(orderId);
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new AppError("Order not found after fulfillment", 404);
  }

  await enqueueJob(
    "reconciliation",
    "reconcile-order",
    { orderId },
    async (payload: { orderId: string }) => {
      await reconcileOrder(payload.orderId);
    },
    `reconcile:${orderId}`
  );

  if (tickets[0]) {
    await enqueueJob(
      "email-delivery",
      "ticket-confirmation",
      {
        to: order.attendeeEmail,
        name: `${order.attendeeFirstName} ${order.attendeeLastName}`.trim() || "Event guest",
        eventTitle:
          typeof tickets[0].eventId === "object" && tickets[0].eventId
            ? ((tickets[0].eventId as { title?: string }).title ?? "EventChimp event")
            : "EventChimp event",
        amount: order.pricing.buyerTotal,
        qrCode: tickets[0].qrCode
      },
      async (payload: {
        to: string;
        name: string;
        eventTitle: string;
        amount: number;
        qrCode: string;
      }) => {
        await sendTicketConfirmationEmail(payload);
      },
      `email:${order.providerReference}`
    );
  }

  return { order, tickets };
};

export const verifyOrderPayment = async (reference: string) => {
  const order = await OrderModel.findOne({
    $or: [{ providerReference: reference }, { publicReference: reference }]
  });
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus === "paid" && order.fulfillmentStatus === "fulfilled") {
    const existingTickets = await TicketModel.find({ orderId: order._id }).populate("eventId");
    return {
      transaction: serializeOrderToTransactionView(order),
      order,
      tickets: existingTickets
    };
  }

  const verification =
    order.pricing.buyerTotal === 0 || !env.PAYSTACK_SECRET_KEY
      ? {
          status: true,
          data: {
            status: "success",
            reference: order.providerReference,
            amount: order.pricing.buyerTotal * 100,
            currency: order.currency,
            channel: order.pricing.buyerTotal === 0 ? "free" : "mock"
          }
        }
      : await verifyPaystackPayment(order.providerReference);

  if (!verification.status || verification.data.status !== "success") {
    order.paymentStatus = "failed";
    await order.save();
    throw new AppError("Payment verification failed", 400);
  }

  const verifiedAmount = Math.round((verification.data.amount ?? 0) / 100);
  if (
    verification.data.reference !== order.providerReference ||
    verifiedAmount !== order.pricing.buyerTotal ||
    (verification.data.currency ?? order.currency) !== order.currency
  ) {
    order.settlementStatus = "mismatch";
    await order.save();
    throw new AppError("Payment verification did not match the expected order values", 400);
  }

  order.paymentStatus = "paid";
  order.paystack = {
    ...order.paystack,
    channel: verification.data.channel ?? "",
    paidAt: verification.data.paid_at ? new Date(verification.data.paid_at) : new Date(),
    verifiedAt: new Date(),
    paidAmount: verifiedAmount,
    verificationPayload: verification.data
  } as never;
  await order.save();
  await recordPaymentLedgerEntries(order);

  const { tickets } = await finalizeOrder(order._id.toString());
  const freshOrder = await OrderModel.findById(order._id);

  return {
    transaction: serializeOrderToTransactionView(freshOrder ?? order),
    order: freshOrder ?? order,
    tickets
  };
};

export const createWebhookLog = async (payload: unknown, rawBody: Buffer, signature?: string) => {
  const eventType =
    typeof payload === "object" && payload && "event" in payload
      ? String((payload as { event?: string }).event ?? "")
      : "unknown";
  const reference =
    typeof payload === "object" && payload && "data" in payload
      ? String(
          ((payload as { data?: { reference?: string } }).data?.reference ?? "") ||
            ((payload as { data?: { transaction_reference?: string } }).data?.transaction_reference ?? "")
        )
      : "";
  const verified = verifyWebhookSignature(rawBody, signature);
  const dedupeKey = `${eventType}:${reference || crypto.randomUUID()}`;

  const existingLog = await WebhookLogModel.findOne({ dedupeKey });
  if (existingLog) {
    return existingLog;
  }

  return WebhookLogModel.create({
    eventType,
    reference,
    signature: signature ?? "",
    verified,
    dedupeKey,
    payload,
    processingStatus: verified ? "received" : "failed",
    processingError: verified ? "" : "Invalid webhook signature"
  });
};

export const processWebhookLog = async (webhookLogId: string) => {
  const webhookLog = await WebhookLogModel.findById(webhookLogId);
  if (!webhookLog) {
    throw new AppError("Webhook log not found", 404);
  }

  if (!webhookLog.verified) {
    webhookLog.processingStatus = "failed";
    webhookLog.processingError = "Invalid webhook signature";
    await webhookLog.save();
    return webhookLog;
  }

  if (webhookLog.processingStatus === "processed") {
    return webhookLog;
  }

  try {
    if (webhookLog.eventType === "charge.success" && webhookLog.reference) {
      await verifyOrderPayment(webhookLog.reference);
      webhookLog.processingStatus = "processed";
      webhookLog.processedAt = new Date();
    } else {
      webhookLog.processingStatus = "ignored";
      webhookLog.processedAt = new Date();
    }

    webhookLog.processingError = "";
  } catch (error) {
    webhookLog.processingStatus = "failed";
    webhookLog.processingError = error instanceof Error ? error.message : "Webhook processing failed";
    throw error;
  } finally {
    await webhookLog.save();
  }

  return webhookLog;
};
