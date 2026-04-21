import { EventModel } from "../models/Event";
import { OrderModel } from "../models/Order";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { TicketModel } from "../models/Ticket";
import { serializeOrderToTransactionView } from "./payment-view.service";

export const getOrganizerDashboard = async (userId: string) => {
  const [events, tickets, orders, organizerProfile] = await Promise.all([
    EventModel.find({ organizerId: userId }).sort({ createdAt: -1 }),
    TicketModel.find().populate({
      path: "eventId",
      match: { organizerId: userId },
      select: "title"
    }),
    OrderModel.find({ organizerId: userId, paymentStatus: { $in: ["paid", "refunded"] } })
      .sort({ createdAt: -1 })
      .populate("eventId", "title"),
    OrganizerProfileModel.findOne({ userId })
  ]);

  const validTickets = tickets.filter((ticket) => ticket.eventId);
  const transactionViews = orders.map((order) => serializeOrderToTransactionView(order as never));
  const revenue = transactionViews.reduce((sum, transaction) => sum + transaction.organizerNetAmount, 0);
  const platformRevenue = transactionViews.reduce(
    (sum, transaction) => sum + (transaction.platformRevenue ?? 0),
    0
  );
  const buyerPaidServiceFees = transactionViews.reduce((sum, transaction) => sum + transaction.serviceFee, 0);
  const pendingSettlements = transactionViews.filter((transaction) => transaction.settlementStatus === "pending").length;
  const mismatchedSettlements = transactionViews.filter((transaction) => transaction.settlementStatus === "mismatch").length;

  return {
    metrics: {
      eventsCount: events.length,
      attendeesCount: validTickets.length,
      revenue,
      platformRevenue,
      buyerPaidServiceFees
    },
    events,
    transactions: transactionViews.slice(0, 8),
    guestList: validTickets.slice(0, 12),
    payout: organizerProfile
      ? {
          payoutReady: organizerProfile.payoutReady,
          payoutStatus: organizerProfile.payoutStatus,
          riskStatus: organizerProfile.riskStatus,
          businessName: organizerProfile.payoutProfile.businessName,
          bankName: organizerProfile.payoutProfile.bankName,
          accountName: organizerProfile.payoutProfile.accountName,
          accountNumberMasked:
            organizerProfile.payoutProfile.accountNumber.length < 4
              ? organizerProfile.payoutProfile.accountNumber
              : `${"*".repeat(organizerProfile.payoutProfile.accountNumber.length - 4)}${organizerProfile.payoutProfile.accountNumber.slice(-4)}`,
          subaccountCode: organizerProfile.payoutProfile.subaccountCode,
          reviewNote: organizerProfile.payoutProfile.reviewNote
        }
      : null,
    settlement: {
      pendingCount: pendingSettlements,
      mismatchCount: mismatchedSettlements
    }
  };
};
