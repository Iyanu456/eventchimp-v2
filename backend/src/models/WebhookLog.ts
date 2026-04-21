import { InferSchemaType, Schema, model } from "mongoose";
import { WEBHOOK_PROCESSING_STATUSES } from "../constants/enums";

const webhookLogSchema = new Schema(
  {
    eventType: { type: String, required: true },
    reference: { type: String, default: "" },
    signature: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    dedupeKey: { type: String, required: true, unique: true },
    processingStatus: { type: String, enum: WEBHOOK_PROCESSING_STATUSES, default: "received" },
    processingError: { type: String, default: "" },
    payload: { type: Schema.Types.Mixed, required: true },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export type WebhookLogDocument = InferSchemaType<typeof webhookLogSchema>;

export const WebhookLogModel = model("WebhookLog", webhookLogSchema);
