import { InferSchemaType, Schema, model } from "mongoose";
import { REFUND_STATUSES } from "../constants/enums";

const refundSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    initiatedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    includeServiceFee: { type: Boolean, default: false },
    status: { type: String, enum: REFUND_STATUSES, default: "requested" },
    reason: { type: String, default: "" },
    merchantNote: { type: String, default: "" },
    paystackRefundId: { type: Number, default: null },
    paystackRefundStatus: { type: String, default: "" },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

refundSchema.index({ orderId: 1, createdAt: -1 });

export type RefundDocument = InferSchemaType<typeof refundSchema>;

export const RefundModel = model("Refund", refundSchema);
