import { Router } from "express";
import {
  payoutBanksController,
  resolvePayoutAccountController,
  payoutStatusController,
  updateOrganizerSettingsController,
  upsertPayoutProfileController
} from "../controllers/organizer.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { organizerSettingsSchema, payoutAccountResolveSchema, payoutProfileSchema } from "../validators/organizer.validator";

export const organizerRouter = Router();

organizerRouter.get("/banks", requireAuth, requireRole("organizer", "admin"), asyncHandler(payoutBanksController));
organizerRouter.get(
  "/payout-status",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(payoutStatusController)
);
organizerRouter.post(
  "/resolve-account",
  requireAuth,
  requireRole("organizer", "admin"),
  validate(payoutAccountResolveSchema),
  asyncHandler(resolvePayoutAccountController)
);
organizerRouter.post(
  "/payout-profile",
  requireAuth,
  requireRole("organizer", "admin"),
  validate(payoutProfileSchema),
  asyncHandler(upsertPayoutProfileController)
);
organizerRouter.patch(
  "/settings",
  requireAuth,
  requireRole("organizer", "admin"),
  validate(organizerSettingsSchema),
  asyncHandler(updateOrganizerSettingsController)
);
