import { z } from "zod";

export const initializeCheckoutSchema = z.object({
  eventId: z.string().min(1)
});

export const verifyCheckoutSchema = z.object({
  reference: z.string().min(1)
});
