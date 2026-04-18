import { InferSchemaType, Schema, model } from "mongoose";
import { PAYMENT_STATUSES } from "../constants/enums";

const ticketSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    purchaserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentReference: { type: String, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    qrCode: { type: String, required: true },
    totalPaid: { type: Number, required: true },
    ticketPrice: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export type TicketDocument = InferSchemaType<typeof ticketSchema> & { _id: string };

export const TicketModel = model("Ticket", ticketSchema);
