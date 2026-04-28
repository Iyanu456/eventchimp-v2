import { z } from "zod";

export const inviteCollaboratorSchema = z.object({
  email: z.string().email(),
  role: z.enum(["manager", "scanner", "viewer"])
});

export const scanTicketSchema = z.object({
  qrToken: z.string().min(1)
});

export const eventSettingsSchema = z.object({
  accessStatus: z.enum(["active", "suspended"]).optional(),
  suspensionReason: z.string().max(240).optional().default("")
});
