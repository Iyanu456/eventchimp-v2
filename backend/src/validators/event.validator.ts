import { z } from "zod";
import { EVENT_STATUSES } from "../constants/enums";

export const eventSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  description: z.string().min(20),
  location: z.string().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.coerce.number().min(1),
  ticketPrice: z.coerce.number().min(0),
  isFree: z.coerce.boolean(),
  status: z.enum(EVENT_STATUSES).optional().default("draft"),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([])
});

export const eventMessageSchema = z.object({
  guestName: z.string().optional().default(""),
  content: z.string().min(3).max(280)
});
