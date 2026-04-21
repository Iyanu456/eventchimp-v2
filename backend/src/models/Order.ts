import { InferSchemaType, Schema, model } from "mongoose";
import {
  ORDER_FULFILLMENT_STATUSES,
  ORDER_PAYMENT_STATUSES,
  SETTLEMENT_STATUSES
} from "../constants/enums";

const customAnswerSchema = new Schema(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const pricingBreakdownSchema = new Schema(
  {
    ticketSubtotal: { type: Number, required: true },
    organizerNetAmount: { type: Number, required: true },
    estimatedTransactionFee: { type: Number, required: true },
    estimatedTransferFee: { type: Number, required: true },
    estimatedStampDuty: { type: Number, required: true },
    platformMargin: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    buyerTotal: { type: Number, required: true }
  },
  { _id: false }
);

const paystackMetadataSchema = new Schema(
  {
    accessCode: { type: String, default: "" },
    authorizationUrl: { type: String, default: "" },
    subaccountCode: { type: String, default: "" },
    transactionCharge: { type: Number, default: 0 },
    bearer: { type: String, default: "account" },
    channel: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    paidAmount: { type: Number, default: 0 },
    verificationPayload: { type: Schema.Types.Mixed, default: null }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    publicReference: { type: String, required: true, unique: true },
    providerReference: { type: String, required: true, unique: true },
    currency: { type: String, default: "NGN" },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchaserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    ticketIds: { type: [Schema.Types.ObjectId], ref: "Ticket", default: [] },
    attendeeFirstName: { type: String, required: true },
    attendeeLastName: { type: String, required: true },
    attendeeEmail: { type: String, required: true },
    attendeePhone: { type: String, default: "" },
    comment: { type: String, default: "" },
    customAnswers: { type: [customAnswerSchema], default: [] },
    ticketTypeId: { type: String, required: true },
    ticketTypeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricing: { type: pricingBreakdownSchema, required: true },
    paymentStatus: { type: String, enum: ORDER_PAYMENT_STATUSES, default: "initialized" },
    fulfillmentStatus: { type: String, enum: ORDER_FULFILLMENT_STATUSES, default: "pending" },
    settlementStatus: { type: String, enum: SETTLEMENT_STATUSES, default: "pending" },
    refundedAmount: { type: Number, default: 0 },
    serviceFeeRefunded: { type: Boolean, default: false },
    paystack: { type: paystackMetadataSchema, default: () => ({}) }
  },
  { timestamps: true }
);

orderSchema.index({ organizerId: 1, createdAt: -1 });
orderSchema.index({ eventId: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const OrderModel = model("Order", orderSchema);
