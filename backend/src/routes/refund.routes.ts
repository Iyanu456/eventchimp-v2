import { Router } from "express";
import { createRefundController } from "../controllers/refund.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { refundSchema } from "../validators/refund.validator";

export const refundRouter = Router();

refundRouter.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  validate(refundSchema),
  asyncHandler(createRefundController)
);
