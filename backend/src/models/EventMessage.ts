import { InferSchemaType, Schema, model } from "mongoose";

const eventMessageSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestName: { type: String, default: "" },
    content: { type: String, required: true, maxlength: 280 }
  },
  { timestamps: true }
);

export type EventMessageDocument = InferSchemaType<typeof eventMessageSchema> & { _id: string };

export const EventMessageModel = model("EventMessage", eventMessageSchema);
