import { InferSchemaType, Schema, model } from "mongoose";
import { PAYMENT_STATUSES } from "../constants/enums";

const transactionSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchaserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", default: null },
    providerReference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    ticketPrice: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    organizerShare: { type: Number, required: true },
    platformRevenue: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" }
  },
  { timestamps: true }
);

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & { _id: string };

export const TransactionModel = model("Transaction", transactionSchema);
