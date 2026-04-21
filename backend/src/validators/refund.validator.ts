import { z } from "zod";

export const refundSchema = z.object({
  orderReference: z.string().min(1),
  amount: z.coerce.number().min(1).optional(),
  reason: z.string().optional().default(""),
  customerNote: z.string().optional().default(""),
  merchantNote: z.string().optional().default(""),
  includeServiceFee: z.coerce.boolean().optional().default(false)
});
