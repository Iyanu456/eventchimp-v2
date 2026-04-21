import { InferSchemaType, Schema, model } from "mongoose";
import { PAYMENT_STATUSES } from "../constants/enums";

const customAnswerSchema = new Schema(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const transactionSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchaserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    ticketIds: { type: [Schema.Types.ObjectId], ref: "Ticket", default: [] },
    providerReference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    ticketPrice: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    organizerShare: { type: Number, required: true },
    platformRevenue: { type: Number, required: true },
    ticketTypeId: { type: String, default: "" },
    ticketTypeName: { type: String, default: "General admission" },
    attendeeFirstName: { type: String, default: "" },
    attendeeLastName: { type: String, default: "" },
    attendeeEmail: { type: String, default: "" },
    attendeePhone: { type: String, default: "" },
    comment: { type: String, default: "" },
    customAnswers: { type: [customAnswerSchema], default: [] },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" }
  },
  { timestamps: true }
);

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & { _id: string };

export const TransactionModel = model("Transaction", transactionSchema);
