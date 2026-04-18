import { InferSchemaType, Schema, model } from "mongoose";
import { EVENT_STATUSES } from "../constants/enums";

const eventSchema = new Schema(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    coverImage: { type: String, default: "" },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, required: true },
    ticketPrice: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    status: { type: String, enum: EVENT_STATUSES, default: "draft" },
    attendeesCount: { type: Number, default: 0 },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export type EventDocument = InferSchemaType<typeof eventSchema> & { _id: string };

export const EventModel = model("Event", eventSchema);
