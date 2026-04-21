import { z } from "zod";
import { ORGANIZER_PAYOUT_STATUSES, RISK_STATUSES } from "../constants/enums";

export const payoutProfileSchema = z.object({
  bankCode: z.string().min(2),
  accountNumber: z.string().min(10).max(10)
});

export const payoutAccountResolveSchema = payoutProfileSchema;

export const organizerReviewSchema = z.object({
  payoutStatus: z.enum(ORGANIZER_PAYOUT_STATUSES).optional(),
  riskStatus: z.enum(RISK_STATUSES).optional(),
  reviewNote: z.string().optional().default("")
});
