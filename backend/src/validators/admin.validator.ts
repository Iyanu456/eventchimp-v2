import { z } from "zod";

export const suspendEventSchema = z.object({
  accessStatus: z.enum(["active", "suspended"]),
  suspensionReason: z.string().optional().default("")
});
