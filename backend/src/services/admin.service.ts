import { EventModel } from "../models/Event";
import { OrderModel } from "../models/Order";
import { UserModel } from "../models/User";
import { AppError } from "../utils/app-error";
import { serializeOrderToTransactionView } from "./payment-view.service";
import { reviewOrganizerPayout } from "./payout.service";

export const getAdminOverview = async () => {
  const [usersCount, eventsCount, orders, recentUsers, recentEvents] = await Promise.all([
    UserModel.countDocuments(),
    EventModel.countDocuments(),
    OrderModel.find({ paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .populate("eventId", "title")
      .populate("organizerId", "name"),
    UserModel.find().sort({ createdAt: -1 }).limit(8),
    EventModel.find().sort({ createdAt: -1 }).limit(8).populate("organizerId", "name")
  ]);

  const grossRevenue = orders.reduce((sum, item) => sum + item.pricing.buyerTotal, 0);
  const recentTransactions = orders.slice(0, 10).map((order) => serializeOrderToTransactionView(order as never));

  return {
    metrics: {
      usersCount,
      eventsCount,
      transactionsCount: orders.length,
      grossRevenue
    },
    recentUsers,
    recentEvents,
    recentTransactions
  };
};

export const getAdminUsers = async () => UserModel.find().sort({ createdAt: -1 });
export const getAdminEvents = async () =>
  EventModel.find().sort({ createdAt: -1 }).populate("organizerId", "name email");
export const getAdminTransactions = async () =>
  OrderModel.find()
    .sort({ createdAt: -1 })
    .populate("eventId", "title")
    .populate("organizerId", "name")
    .then((orders) => orders.map((order) => serializeOrderToTransactionView(order as never)));

export const suspendAdminEvent = async (
  eventId: string,
  input: { accessStatus: "active" | "suspended"; suspensionReason?: string }
) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  event.accessStatus = input.accessStatus;
  event.suspensionReason = input.accessStatus === "suspended" ? input.suspensionReason ?? "" : "";
  if (input.accessStatus === "suspended") {
    event.riskStatus = "under_review";
  }
  await event.save();

  return event;
};

export const reviewOrganizerForAdmin = async (
  userId: string,
  input: {
    payoutStatus?: "pending_review" | "verified" | "rejected" | "suspended";
    riskStatus?: "clear" | "under_review" | "blocked";
    reviewNote?: string;
  }
) => reviewOrganizerPayout(userId, input);
