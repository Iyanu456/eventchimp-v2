import { InferSchemaType, Schema, model } from "mongoose";
import { EVENT_COLLABORATOR_ROLES, INVITATION_STATUSES } from "../constants/enums";

const eventInvitationSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: EVENT_COLLABORATOR_ROLES, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    status: { type: String, enum: INVITATION_STATUSES, default: "pending" },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

eventInvitationSchema.index({ eventId: 1, email: 1, status: 1 });
eventInvitationSchema.index({ email: 1, status: 1 });

export type EventInvitationDocument = InferSchemaType<typeof eventInvitationSchema> & { _id: string };

export const EventInvitationModel = model("EventInvitation", eventInvitationSchema);
