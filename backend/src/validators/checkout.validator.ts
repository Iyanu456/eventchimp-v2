import { z } from "zod";

const checkoutAnswerSchema = z.object({
  fieldId: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1)
});

export const checkoutQuoteSchema = z.object({
  eventId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.coerce.number().min(1).max(20)
});

export const initializeCheckoutSchema = z.object({
  eventId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.coerce.number().min(1).max(20),
  attendeeFirstName: z.string().min(1),
  attendeeLastName: z.string().min(1),
  attendeeEmail: z.string().email(),
  attendeePhone: z.string().optional().default(""),
  comment: z.string().optional().default(""),
  customAnswers: z.array(checkoutAnswerSchema).optional().default([])
});

export const verifyCheckoutSchema = z.object({
  reference: z.string().min(1)
});
