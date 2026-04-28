import { EventModel } from "../models/Event";
import { EventCollaboratorModel } from "../models/EventCollaborator";
import { EventCollaboratorRole } from "../constants/enums";
import { AppError } from "../utils/app-error";

type EventRecord = NonNullable<Awaited<ReturnType<typeof EventModel.findById>>>;

const roleRank: Record<EventCollaboratorRole, number> = {
  owner: 4,
  manager: 3,
  scanner: 2,
  viewer: 1
};

export type EventAccessContext = {
  event: EventRecord;
  organizerId: string;
  role: EventCollaboratorRole | "admin";
  collaboratorId?: string;
};

export const getEventAccessContext = async (
  eventId: string,
  actor: Express.User
): Promise<EventAccessContext> => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const organizerId = event.organizerId.toString();

  if (actor.role === "admin") {
    return {
      event,
      organizerId,
      role: "admin"
    };
  }

  if (organizerId === actor.id) {
    return {
      event,
      organizerId,
      role: "owner"
    };
  }

  const collaborator = await EventCollaboratorModel.findOne({
    eventId,
    userId: actor.id
  });

  if (!collaborator) {
    throw new AppError("You do not have access to this event", 403);
  }

  return {
    event,
    organizerId,
    role: collaborator.role,
    collaboratorId: collaborator._id.toString()
  };
};

export const assertEventRole = async (
  eventId: string,
  actor: Express.User,
  minimumRole: EventCollaboratorRole
) => {
  const context = await getEventAccessContext(eventId, actor);
  if (context.role === "admin") {
    return context;
  }

  if (roleRank[context.role] < roleRank[minimumRole]) {
    throw new AppError("You do not have permission to access this event resource", 403);
  }

  return context;
};

export const listEventCollaborators = async (eventId: string) =>
  EventCollaboratorModel.find({ eventId }).populate("userId", "name email avatar").sort({ createdAt: 1 });
