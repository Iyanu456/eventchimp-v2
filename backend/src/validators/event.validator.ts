import { z } from "zod";
import { EVENT_STATUSES } from "../constants/enums";

const jsonStringOr = <T extends z.ZodTypeAny>(schema: T) => z.union([schema, z.string()]);

const ticketTierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1),
  order: z.coerce.number().min(0),
  perks: z.array(z.string()).optional().default([])
});

const recurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  interval: z.coerce.number().min(1).default(1),
  until: z.string().datetime().optional().or(z.literal("")).default(""),
  daysOfWeek: z.array(z.string()).optional().default([])
});

const streamingSchema = z.object({
  provider: z.string().min(1).default("zoom"),
  url: z.string().optional().default(""),
  meetingCode: z.string().optional().default(""),
  password: z.string().optional().default(""),
  notes: z.string().optional().default("")
});

const guestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  imageUrl: z.string().optional().default(""),
  bio: z.string().optional().default("")
});

const customFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "select"]).default("text"),
  required: z.coerce.boolean().default(false),
  placeholder: z.string().optional().default(""),
  options: z.array(z.string()).optional().default([])
});

const eventBaseSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  description: z.string().min(3),
  location: z.string().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.coerce.number().min(1),
  ticketPrice: z.coerce.number().min(0).optional().default(0),
  isFree: z.coerce.boolean().optional().default(false),
  status: z.enum(EVENT_STATUSES).optional().default("published"),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
  scheduleType: z.enum(["single", "recurring"]).optional().default("single"),
  recurrence: jsonStringOr(recurrenceSchema).optional(),
  attendanceMode: z.enum(["in_person", "virtual", "hybrid"]).optional().default("in_person"),
  streaming: jsonStringOr(streamingSchema).optional(),
  ticketTiers: jsonStringOr(z.array(ticketTierSchema)).optional().default([]),
  guests: jsonStringOr(z.array(guestSchema)).optional().default([]),
  customFields: jsonStringOr(z.array(customFieldSchema)).optional().default([])
});

const addDateRangeIssues = (
  data: { startDate?: string; endDate?: string },
  context: z.RefinementCtx,
  options: { requireFutureStart: boolean }
) => {
  const start = data.startDate ? new Date(data.startDate) : null;
  const end = data.endDate ? new Date(data.endDate) : null;

  if (start && Number.isNaN(start.getTime())) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["startDate"],
      message: "Choose a valid event start date and time"
    });
  }

  if (end && Number.isNaN(end.getTime())) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "Choose a valid event end date and time"
    });
  }

  if (options.requireFutureStart && start && start.getTime() < Date.now() - 60 * 1000) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["startDate"],
      message: "Event start time cannot be in the past"
    });
  }

  if (start && end && end <= start) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "Event end time must be after the start time"
    });
  }
};

export const eventSchema = eventBaseSchema.superRefine((data, context) => {
  addDateRangeIssues(data, context, { requireFutureStart: true });
});

export const eventUpdateSchema = eventBaseSchema.partial().superRefine((data, context) => {
  addDateRangeIssues(data, context, { requireFutureStart: false });
});

export const eventMessageSchema = z.object({
  guestName: z.string().optional().default(""),
  content: z.string().min(3).max(280)
});
