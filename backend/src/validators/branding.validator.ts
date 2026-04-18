import { z } from "zod";
import { BRANDING_ASSET_TYPES } from "../constants/enums";

export const brandingMetadataSchema = z.object({
  eventId: z.string().min(1),
  type: z.enum(BRANDING_ASSET_TYPES),
  eventName: z.string().min(2),
  date: z.string().min(2),
  venue: z.string().min(2),
  organizerName: z.string().min(2),
  sponsorName: z.string().optional().default(""),
  logo: z.string().optional().default(""),
  accentColor: z.string().optional().default("#4F46E5")
});
