import { InferSchemaType, Schema, model } from "mongoose";
import { LEDGER_ENTRY_TYPES, SETTLEMENT_STATUSES } from "../constants/enums";

const estimatedCostsSchema = new Schema(
  {
    estimatedTransactionFee: { type: Number, required: true },
    estimatedTransferFee: { type: Number, required: true },
    estimatedStampDuty: { type: Number, required: true },
    platformMargin: { type: Number, required: true }
  },
  { _id: false }
);

const ledgerEntrySchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchaserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    entryType: { type: String, enum: LEDGER_ENTRY_TYPES, required: true },
    reference: { type: String, required: true },
    currency: { type: String, default: "NGN" },
    grossAmount: { type: Number, required: true },
    ticketSubtotal: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    organizerNet: { type: Number, required: true },
    estimatedCosts: { type: estimatedCostsSchema, required: true },
    settlementStatus: { type: String, enum: SETTLEMENT_STATUSES, default: "pending" },
    note: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

ledgerEntrySchema.index({ orderId: 1, entryType: 1, reference: 1 }, { unique: true });
ledgerEntrySchema.index({ organizerId: 1, createdAt: -1 });

export type LedgerEntryDocument = InferSchemaType<typeof ledgerEntrySchema>;

export const LedgerEntryModel = model("LedgerEntry", ledgerEntrySchema);
