import { EventModel } from "../models/Event";
import { TicketModel } from "../models/Ticket";
import { TransactionModel } from "../models/Transaction";

export const getOrganizerDashboard = async (userId: string) => {
  const [events, tickets, transactions] = await Promise.all([
    EventModel.find({ organizerId: userId }).sort({ createdAt: -1 }),
    TicketModel.find().populate({
      path: "eventId",
      match: { organizerId: userId },
      select: "title"
    }),
    TransactionModel.find({ organizerId: userId, status: "success" }).sort({ createdAt: -1 })
  ]);

  const validTickets = tickets.filter((ticket) => ticket.eventId);
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.organizerShare, 0);
  const platformRevenue = transactions.reduce(
    (sum, transaction) => sum + transaction.platformRevenue,
    0
  );

  return {
    metrics: {
      eventsCount: events.length,
      attendeesCount: validTickets.length,
      revenue,
      platformRevenue
    },
    events,
    transactions: transactions.slice(0, 8),
    guestList: validTickets.slice(0, 12)
  };
};
