import { Request, Response } from "express";
import {
  getAdminEvents,
  getAdminOverview,
  getAdminTransactions,
  getAdminUsers,
  reviewOrganizerForAdmin,
  suspendAdminEvent
} from "../services/admin.service";
import { apiResponse } from "../utils/api-response";

export const adminOverviewController = async (_req: Request, res: Response) => {
  const payload = await getAdminOverview();
  res.json(apiResponse(payload, "Admin overview fetched successfully"));
};

export const adminUsersController = async (_req: Request, res: Response) => {
  const payload = await getAdminUsers();
  res.json(apiResponse(payload, "Admin users fetched successfully"));
};

export const adminEventsController = async (_req: Request, res: Response) => {
  const payload = await getAdminEvents();
  res.json(apiResponse(payload, "Admin events fetched successfully"));
};

export const adminTransactionsController = async (_req: Request, res: Response) => {
  const payload = await getAdminTransactions();
  res.json(apiResponse(payload, "Admin transactions fetched successfully"));
};

export const suspendAdminEventController = async (req: Request, res: Response) => {
  const payload = await suspendAdminEvent(String(req.params.id), req.body);
  res.json(apiResponse(payload, "Admin event access updated successfully"));
};

export const adminOrganizerReviewController = async (req: Request, res: Response) => {
  const payload = await reviewOrganizerForAdmin(String(req.params.userId), req.body);
  res.json(apiResponse(payload, "Organizer review updated successfully"));
};
