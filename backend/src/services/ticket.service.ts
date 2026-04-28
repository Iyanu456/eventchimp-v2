import { TicketModel } from "../models/Ticket";
import { AppError } from "../utils/app-error";
import { hashQrToken } from "../utils/qr";
import { assertEventRole, getEventAccessContext } from "./event-access.service";

const extractQrToken = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const token = parts.at(-1);
    return token ?? trimmed;
  } catch {
    return trimmed;
  }
};

const serializeTicketScanResult = (
  status: "valid" | "used",
  ticket:
    | {
        _id: { toString: () => string };
        ticketCode: string;
        ticketTypeName: string;
        attendeeFirstName: string;
        attendeeLastName: string;
        attendeeEmail: string;
        checkedInAt?: Date | null;
        orderReference: string;
      }
    | null
) => ({
  status,
  ticket: ticket
    ? {
        id: ticket._id.toString(),
        ticketCode: ticket.ticketCode,
        ticketTypeName: ticket.ticketTypeName,
        attendeeName: `${ticket.attendeeFirstName} ${ticket.attendeeLastName}`.trim() || "Guest attendee",
        attendeeEmail: ticket.attendeeEmail,
        checkedInAt: ticket.checkedInAt,
        orderReference: ticket.orderReference
      }
    : null
});

export const getMyTickets = async (userId: string) =>
  TicketModel.find({ purchaserId: userId })
    .sort({ createdAt: -1 })
    .populate("eventId", "title slug coverImage location startDate");

export const getEventGuestList = async (eventId: string, actor: Express.User) => {
  await assertEventRole(eventId, actor, "viewer");
  return TicketModel.find({ eventId }).populate("purchaserId", "name email avatar").sort({ createdAt: -1 });
};

export const scanEventTicket = async (eventId: string, actor: Express.User, value: string) => {
  await assertEventRole(eventId, actor, "scanner");
  const token = extractQrToken(value);
  if (!token) {
    return { status: "invalid" as const, ticket: null };
  }

  const ticket = await TicketModel.findOne({
    eventId,
    qrTokenHash: hashQrToken(token)
  });

  if (!ticket) {
    return { status: "invalid" as const, ticket: null };
  }

  if (ticket.paymentStatus === "refunded" || ticket.status === "refunded" || ticket.status === "voided") {
    return { status: "invalid" as const, ticket: null };
  }

  if (ticket.checkedIn) {
    return serializeTicketScanResult("used", ticket);
  }

  return serializeTicketScanResult("valid", ticket);
};

export const checkInEventTicket = async (eventId: string, actor: Express.User, value: string) => {
  await assertEventRole(eventId, actor, "scanner");
  const token = extractQrToken(value);
  if (!token) {
    throw new AppError("Ticket token is required", 400);
  }

  const ticket = await TicketModel.findOne({
    eventId,
    qrTokenHash: hashQrToken(token)
  }).populate("eventId");

  if (!ticket) {
    throw new AppError("Ticket not found for this event", 404);
  }

  if (ticket.paymentStatus === "refunded" || ticket.status === "refunded" || ticket.status === "voided") {
    throw new AppError("Refunded or voided tickets cannot be checked in", 400);
  }

  if (!ticket.checkedIn) {
    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = actor.id as never;
    ticket.status = "checked_in";
    await ticket.save();
  }

  return ticket;
};

export const checkInTicket = async (ticketId: string, actor: Express.User) => {
  const ticket = await TicketModel.findById(ticketId).populate("eventId");
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const context = await getEventAccessContext(
    (ticket.eventId as { _id: { toString: () => string } })._id.toString(),
    actor
  );
  if (context.role !== "admin" && context.role !== "owner" && context.role !== "manager" && context.role !== "scanner") {
    throw new AppError("You cannot check in guests for this event", 403);
  }

  if (ticket.paymentStatus === "refunded" || ticket.status === "refunded" || ticket.status === "voided") {
    throw new AppError("Refunded tickets cannot be checked in", 400);
  }

  if (!ticket.checkedIn) {
    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = actor.id as never;
    ticket.status = "checked_in";
    await ticket.save();
  }

  return ticket;
};
