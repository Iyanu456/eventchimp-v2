import { z } from "zod";
import { USER_ROLES } from "../constants/enums";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(USER_ROLES).optional().default("organizer")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const googleCallbackSchema = z.object({
  code: z.string().min(1)
});
