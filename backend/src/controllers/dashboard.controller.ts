import { Request, Response } from "express";
import { getOrganizerDashboard } from "../services/dashboard.service";
import { apiResponse } from "../utils/api-response";

export const organizerDashboardController = async (req: Request, res: Response) => {
  const payload = await getOrganizerDashboard(req.user!.id);
  res.json(apiResponse(payload, "Organizer dashboard fetched successfully"));
};
