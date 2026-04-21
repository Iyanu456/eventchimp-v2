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

const ticketSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    ticketSequence: { type: Number, default: 0 },
    purchaserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    paymentReference: { type: String, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    qrCode: { type: String, required: true },
    totalPaid: { type: Number, required: true },
    ticketPrice: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    ticketTypeId: { type: String, default: "" },
    ticketTypeName: { type: String, default: "General admission" },
    attendeeFirstName: { type: String, default: "" },
    attendeeLastName: { type: String, default: "" },
    attendeeEmail: { type: String, default: "" },
    attendeePhone: { type: String, default: "" },
    orderReference: { type: String, default: "" },
    customAnswers: { type: [customAnswerSchema], default: [] },
    comment: { type: String, default: "" },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null }
  },
  { timestamps: true }
);

ticketSchema.index({ orderId: 1, ticketSequence: 1 }, { unique: true, sparse: true });
ticketSchema.index({ paymentReference: 1 }, { unique: true });

export type TicketDocument = InferSchemaType<typeof ticketSchema> & { _id: string };

export const TicketModel = model("Ticket", ticketSchema);
