import { EventModel } from "../models/Event";
import { TicketModel } from "../models/Ticket";
import { AppError } from "../utils/app-error";

export const getMyTickets = async (userId: string) =>
  TicketModel.find({ purchaserId: userId })
    .sort({ createdAt: -1 })
    .populate("eventId", "title slug coverImage location startDate");

export const getEventGuestList = async (eventId: string, actor: Express.User) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (actor.role !== "admin" && event.organizerId.toString() !== actor.id) {
    throw new AppError("You cannot access this guest list", 403);
  }

  return TicketModel.find({ eventId }).populate("purchaserId", "name email avatar");
};

export const checkInTicket = async (ticketId: string, actor: Express.User) => {
  const ticket = await TicketModel.findById(ticketId).populate("eventId");
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const event = ticket.eventId as unknown as { organizerId: { toString: () => string } };
  if (actor.role !== "admin" && event.organizerId.toString() !== actor.id) {
    throw new AppError("You cannot check in guests for this event", 403);
  }

  ticket.checkedIn = true;
  ticket.checkedInAt = new Date();
  await ticket.save();

  return ticket;
};
