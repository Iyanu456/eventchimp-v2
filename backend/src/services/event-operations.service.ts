import crypto from "crypto";
import { EventModel } from "../models/Event";
import { EventCollaboratorModel } from "../models/EventCollaborator";
import { EventInvitationModel } from "../models/EventInvitation";
import { OrderModel } from "../models/Order";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { RefundModel } from "../models/Refund";
import { TicketModel } from "../models/Ticket";
import { EventCollaboratorRole } from "../constants/enums";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { getEventAccessContext } from "./event-access.service";
import { enqueueJob } from "./job-queue.service";
import { sendInvitationEmail } from "./email.service";

type InviteCollaboratorInput = {
  email: string;
  role: "manager" | "scanner" | "viewer";
};

type UpdateEventSettingsInput = {
  accessStatus?: "active" | "suspended";
  suspensionReason?: string;
};

const hashToken = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const createInvitationToken = () => crypto.randomBytes(24).toString("hex");
const financeVisibleRoles: Array<EventCollaboratorRole | "admin"> = ["owner", "manager", "viewer", "admin"];

export const listEventCollaboratorsWithInvites = async (eventId: string, actor: Express.User) => {
  const context = await getEventAccessContext(eventId, actor);
  if (!["owner", "manager", "viewer", "admin"].includes(context.role)) {
    throw new AppError("You do not have permission to view collaborators for this event", 403);
  }

  const [event, organizerProfile, collaborators, invitations] = await Promise.all([
    EventModel.findById(eventId).populate("organizerId", "name email avatar"),
    OrganizerProfileModel.findOne({ userId: context.organizerId }),
    EventCollaboratorModel.find({ eventId }).populate("userId", "name email avatar").sort({ createdAt: 1 }),
    EventInvitationModel.find({ eventId, status: "pending", expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 })
  ]);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return {
    currentRole: context.role,
    collaborators: [
      {
        id: `owner:${context.organizerId}`,
        role: "owner" as const,
        acceptedAt: organizerProfile?.createdAt ?? event.createdAt,
        user:
          typeof event.organizerId === "object" && event.organizerId
            ? {
                id: String((event.organizerId as { _id?: unknown })._id ?? context.organizerId),
                name: (event.organizerId as { name?: string }).name ?? "Organizer",
                email: (event.organizerId as { email?: string }).email ?? "",
                avatar: (event.organizerId as { avatar?: string | null }).avatar ?? null
              }
            : null
      },
      ...collaborators.map((item) => ({
        id: item._id.toString(),
        role: item.role,
        acceptedAt: item.acceptedAt,
        user:
          typeof item.userId === "object" && item.userId
            ? {
                id: String((item.userId as { _id?: unknown })._id ?? ""),
                name: (item.userId as { name?: string }).name ?? "",
                email: (item.userId as { email?: string }).email ?? "",
                avatar: (item.userId as { avatar?: string | null }).avatar ?? null
              }
            : null
      }))
    ],
    invitations: invitations.map((item) => ({
      id: item._id.toString(),
      email: item.email,
      role: item.role,
      status: item.status,
      expiresAt: item.expiresAt
    }))
  };
};

export const inviteEventCollaborator = async (
  eventId: string,
  actor: Express.User,
  input: InviteCollaboratorInput
) => {
  const context = await getEventAccessContext(eventId, actor);
  if (context.role !== "admin" && context.role !== "owner") {
    throw new AppError("Only the event owner can invite collaborators", 403);
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const token = createInvitationToken();
  const invitation = await EventInvitationModel.create({
    eventId,
    organizerId: context.organizerId,
    email: normalizedEmail,
    role: input.role,
    invitedBy: actor.id,
    tokenHash: hashToken(token),
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });

  await enqueueJob(
    "email-delivery",
    "event-invitation",
    {
      to: normalizedEmail,
      inviterName: actor.name,
      eventTitle: event.title,
      role: input.role,
      acceptUrl: `${env.CLIENT_URL}/invitations/${token}`
    },
    async (payload) => {
      await sendInvitationEmail(payload as Parameters<typeof sendInvitationEmail>[0]);
    },
    `invite:${invitation._id.toString()}`
  );

  return {
    id: invitation._id.toString(),
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt
  };
};

export const acceptEventInvitation = async (token: string, actor: Express.User) => {
  const invitation = await EventInvitationModel.findOne({
    tokenHash: hashToken(token),
    status: "pending"
  });

  if (!invitation || invitation.expiresAt <= new Date()) {
    throw new AppError("This invitation is no longer valid", 404);
  }

  if (invitation.email !== actor.email.trim().toLowerCase()) {
    throw new AppError("This invitation was sent to a different email address", 403);
  }

  const event = await EventModel.findById(invitation.eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  await EventCollaboratorModel.findOneAndUpdate(
    { eventId: invitation.eventId, userId: actor.id },
    {
      $set: {
        organizerId: invitation.organizerId,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        acceptedAt: new Date()
      }
    },
    { new: true, upsert: true }
  );

  invitation.status = "accepted";
  invitation.acceptedAt = new Date();
  await invitation.save();

  return {
    eventId: event._id.toString(),
    eventTitle: event.title,
    role: invitation.role
  };
};

export const updateEventSettings = async (eventId: string, actor: Express.User, input: UpdateEventSettingsInput) => {
  const context = await getEventAccessContext(eventId, actor);
  if (context.role !== "admin" && context.role !== "owner" && context.role !== "manager") {
    throw new AppError("You do not have permission to update event settings", 403);
  }

  const event = context.event as {
    accessStatus: "active" | "suspended";
    suspensionReason: string;
    save: () => Promise<unknown>;
  };

  if (input.accessStatus) {
    event.accessStatus = input.accessStatus;
  }

  if (input.suspensionReason !== undefined) {
    event.suspensionReason = input.suspensionReason;
  }

  await event.save();
  return context.event;
};

export const getEventMetrics = async (eventId: string, actor: Express.User) => {
  const context = await getEventAccessContext(eventId, actor);
  if (context.role === "viewer") {
    // viewers are allowed full event reporting but no payout account data
  } else if (context.role !== "admin" && context.role !== "owner" && context.role !== "manager" && context.role !== "scanner") {
    throw new AppError("You do not have permission to access event metrics", 403);
  }

  const [orders, tickets, refunds] = await Promise.all([
    OrderModel.find({ eventId, paymentStatus: { $in: ["paid", "refunded"] } }).sort({ createdAt: 1 }),
    TicketModel.find({ eventId }).sort({ createdAt: 1 }),
    RefundModel.find({ eventId }).sort({ createdAt: 1 })
  ]);

  const totalTicketsSold = orders.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrders = orders.length;
  const grossRevenue = orders.reduce((sum, item) => sum + item.pricing.buyerTotal, 0);
  const organizerNetRevenue = orders.reduce((sum, item) => sum + item.pricing.organizerNetAmount, 0);
  const serviceFees = orders.reduce((sum, item) => sum + item.pricing.serviceFee, 0);
  const checkIns = tickets.filter((ticket) => ticket.checkedIn).length;
  const checkInRate = totalTicketsSold > 0 ? Number(((checkIns / totalTicketsSold) * 100).toFixed(2)) : 0;
  const refundAmount = refunds.reduce((sum, item) => sum + item.amount, 0);

  const ticketTierMap = new Map<
    string,
    {
      ticketTypeId: string;
      ticketTypeName: string;
      ticketsSold: number;
      grossRevenue: number;
      organizerNetRevenue: number;
      serviceFees: number;
    }
  >();

  const timelineMap = new Map<
    string,
    {
      date: string;
      totalOrders: number;
      totalTicketsSold: number;
      grossRevenue: number;
      organizerNetRevenue: number;
      serviceFees: number;
    }
  >();

  orders.forEach((order) => {
    const tierKey = order.ticketTypeId || "general";
    const tierBucket = ticketTierMap.get(tierKey) ?? {
      ticketTypeId: order.ticketTypeId,
      ticketTypeName: order.ticketTypeName,
      ticketsSold: 0,
      grossRevenue: 0,
      organizerNetRevenue: 0,
      serviceFees: 0
    };
    tierBucket.ticketsSold += order.quantity;
    tierBucket.grossRevenue += order.pricing.buyerTotal;
    tierBucket.organizerNetRevenue += order.pricing.organizerNetAmount;
    tierBucket.serviceFees += order.pricing.serviceFee;
    ticketTierMap.set(tierKey, tierBucket);

    const day = order.createdAt.toISOString().slice(0, 10);
    const timelineBucket = timelineMap.get(day) ?? {
      date: day,
      totalOrders: 0,
      totalTicketsSold: 0,
      grossRevenue: 0,
      organizerNetRevenue: 0,
      serviceFees: 0
    };
    timelineBucket.totalOrders += 1;
    timelineBucket.totalTicketsSold += order.quantity;
    timelineBucket.grossRevenue += order.pricing.buyerTotal;
    timelineBucket.organizerNetRevenue += order.pricing.organizerNetAmount;
    timelineBucket.serviceFees += order.pricing.serviceFee;
    timelineMap.set(day, timelineBucket);
  });

  const baseMetrics = {
    accessLevel: financeVisibleRoles.includes(context.role) ? "full" : "scanner",
    totalTicketsSold,
    totalOrders,
    checkIns,
    checkInRate,
    remainingGuests: Math.max(totalTicketsSold - checkIns, 0),
    ticketTierBreakdown: [...ticketTierMap.values()],
    salesTimeline: [...timelineMap.values()]
  };

  if (!financeVisibleRoles.includes(context.role)) {
    return baseMetrics;
  }

  return {
    ...baseMetrics,
    grossRevenue,
    organizerNetRevenue,
    serviceFees,
    refunds: {
      count: refunds.length,
      amount: refundAmount
    }
  };
};
