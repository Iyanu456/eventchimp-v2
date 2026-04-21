import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const senderEmailSchema = z
  .string()
  .optional()
  .default("hello@eventchimp.com")
  .transform((value) => value.trim())
  .refine((value) => {
    if (!value) {
      return true;
    }

    const angleMatch = value.match(/<([^<>]+)>/);
    const candidate = angleMatch ? angleMatch[1] : value;

    return z.string().email().safeParse(candidate).success;
  }, "RESEND_FROM_EMAIL must be a valid email or sender format like 'EventChimp <hello@eventchimp.com>'");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().optional().default(""),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PAYSTACK_SECRET_KEY: z.string().optional().default(""),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional().default(""),
  PAYSTACK_PUBLIC_KEY: z.string().optional().default(""),
  PAYSTACK_CALLBACK_URL: z.string().url().default("http://localhost:3000/events"),
  PAYSTACK_TRANSACTION_PERCENT: z.coerce.number().default(1.5),
  PAYSTACK_TRANSACTION_FLAT_FEE: z.coerce.number().default(100),
  PAYSTACK_TRANSACTION_FLAT_FEE_WAIVER_THRESHOLD: z.coerce.number().default(2500),
  PAYSTACK_TRANSACTION_FEE_CAP: z.coerce.number().default(2000),
  PAYSTACK_TRANSFER_FEE_BELOW_5000: z.coerce.number().default(10),
  PAYSTACK_TRANSFER_FEE_BELOW_50000: z.coerce.number().default(25),
  PAYSTACK_TRANSFER_FEE_ABOVE_50000: z.coerce.number().default(50),
  PAYSTACK_STAMP_DUTY_THRESHOLD: z.coerce.number().default(10000),
  PAYSTACK_STAMP_DUTY_AMOUNT: z.coerce.number().default(50),
  PLATFORM_MARGIN_TYPE: z.enum(["flat", "percent"]).default("flat"),
  PLATFORM_MARGIN_VALUE: z.coerce.number().default(400),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM_EMAIL: senderEmailSchema,
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().url().default("http://localhost:4000/api/auth/google/callback"),
  SEED_ON_BOOT: z
    .string()
    .optional()
    .default("true")
    .transform((value) => value === "true")
});

export const env = envSchema.parse(process.env);
