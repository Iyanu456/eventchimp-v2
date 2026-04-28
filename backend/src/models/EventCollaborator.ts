import { InferSchemaType, Schema, model } from "mongoose";
import { EVENT_COLLABORATOR_ROLES } from "../constants/enums";

const eventCollaboratorSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: EVENT_COLLABORATOR_ROLES, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAt: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

eventCollaboratorSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventCollaboratorSchema.index({ organizerId: 1, userId: 1 });

export type EventCollaboratorDocument = InferSchemaType<typeof eventCollaboratorSchema> & { _id: string };

export const EventCollaboratorModel = model("EventCollaborator", eventCollaboratorSchema);
