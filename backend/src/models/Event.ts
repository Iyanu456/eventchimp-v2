import { InferSchemaType, Schema, model } from "mongoose";
import { EVENT_ACCESS_STATUSES, EVENT_STATUSES, RISK_STATUSES } from "../constants/enums";

const ticketTierSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    order: { type: Number, default: 0 },
    perks: [{ type: String }]
  },
  { _id: false }
);

const recurrenceSchema = new Schema(
  {
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "weekly" },
    interval: { type: Number, default: 1, min: 1 },
    until: { type: Date, default: null },
    daysOfWeek: [{ type: String }]
  },
  { _id: false }
);

const streamingSchema = new Schema(
  {
    provider: { type: String, default: "zoom" },
    url: { type: String, default: "" },
    meetingCode: { type: String, default: "" },
    password: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const guestSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    bio: { type: String, default: "" }
  },
  { _id: false }
);

const customFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ["text", "number", "select"], default: "text" },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    options: [{ type: String }]
  },
  { _id: false }
);

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
    tags: [{ type: String }],
    scheduleType: { type: String, enum: ["single", "recurring"], default: "single" },
    recurrence: { type: recurrenceSchema, default: null },
    attendanceMode: { type: String, enum: ["in_person", "virtual", "hybrid"], default: "in_person" },
    streaming: { type: streamingSchema, default: null },
    ticketTiers: { type: [ticketTierSchema], default: [] },
    guests: { type: [guestSchema], default: [] },
    customFields: { type: [customFieldSchema], default: [] },
    payoutReady: { type: Boolean, default: false },
    accessStatus: { type: String, enum: EVENT_ACCESS_STATUSES, default: "active" },
    riskStatus: { type: String, enum: RISK_STATUSES, default: "clear" },
    suspensionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

export type EventDocument = InferSchemaType<typeof eventSchema> & { _id: string };

export const EventModel = model("Event", eventSchema);
