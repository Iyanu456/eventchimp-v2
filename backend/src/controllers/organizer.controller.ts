import { Request, Response } from "express";
import {
  getOrganizerPayoutStatus,
  getPayoutBanks,
  resolveOrganizerPayoutAccount,
  updateOrganizerSettings,
  upsertOrganizerPayoutProfile
} from "../services/payout.service";
import { apiResponse } from "../utils/api-response";

export const payoutBanksController = async (_req: Request, res: Response) => {
  const payload = await getPayoutBanks();
  res.json(apiResponse(payload, "Payout banks fetched successfully"));
};

export const payoutStatusController = async (req: Request, res: Response) => {
  const payload = await getOrganizerPayoutStatus(req.user!.id);
  res.json(apiResponse(payload, "Payout status fetched successfully"));
};

export const resolvePayoutAccountController = async (req: Request, res: Response) => {
  const payload = await resolveOrganizerPayoutAccount(req.body);
  res.json(apiResponse(payload, "Payout account resolved successfully"));
};

export const upsertPayoutProfileController = async (req: Request, res: Response) => {
  const payload = await upsertOrganizerPayoutProfile(req.user!.id, req.body);
  res.status(201).json(apiResponse(payload, "Payout profile saved successfully"));
};

export const updateOrganizerSettingsController = async (req: Request, res: Response) => {
  const payload = await updateOrganizerSettings(req.user!.id, req.body);
  res.json(apiResponse(payload, "Organizer settings updated successfully"));
};
