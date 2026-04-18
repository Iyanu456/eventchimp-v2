import { EventModel } from "../models/Event";
import { TransactionModel } from "../models/Transaction";
import { UserModel } from "../models/User";

export const getAdminOverview = async () => {
  const [usersCount, eventsCount, transactions, recentUsers, recentEvents] = await Promise.all([
    UserModel.countDocuments(),
    EventModel.countDocuments(),
    TransactionModel.find({ status: "success" }).sort({ createdAt: -1 }),
    UserModel.find().sort({ createdAt: -1 }).limit(8),
    EventModel.find().sort({ createdAt: -1 }).limit(8).populate("organizerId", "name")
  ]);

  const grossRevenue = transactions.reduce((sum, item) => sum + item.amount, 0);

  return {
    metrics: {
      usersCount,
      eventsCount,
      transactionsCount: transactions.length,
      grossRevenue
    },
    recentUsers,
    recentEvents,
    recentTransactions: transactions.slice(0, 10)
  };
};

export const getAdminUsers = async () => UserModel.find().sort({ createdAt: -1 });
export const getAdminEvents = async () =>
  EventModel.find().sort({ createdAt: -1 }).populate("organizerId", "name email");
export const getAdminTransactions = async () =>
  TransactionModel.find()
    .sort({ createdAt: -1 })
    .populate("eventId", "title")
    .populate("organizerId", "name");
