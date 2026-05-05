import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isBlank = (value?: string | null) => !value || value.trim().length === 0;

const resolveModeValue = (mode: "development" | "test" | "production", values: { shared?: string; test?: string; live?: string }) =>
  mode === "production" ? values.live || values.shared || "" : values.test || values.shared || "";

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
  MONGODB_URI: z.string().optional().default(""),
  MONGODB_TEST_URI: z.string().optional().default(""),
  MONGODB_LIVE_URI: z.string().optional().default(""),
  REDIS_URL: z.string().optional().default(""),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PAYSTACK_SECRET_KEY: z.string().optional().default(""),
  PAYSTACK_TEST_SECRET_KEY: z.string().optional().default(""),
  PAYSTACK_LIVE_SECRET_KEY: z.string().optional().default(""),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional().default(""),
  PAYSTACK_TEST_WEBHOOK_SECRET: z.string().optional().default(""),
  PAYSTACK_LIVE_WEBHOOK_SECRET: z.string().optional().default(""),
  PAYSTACK_PUBLIC_KEY: z.string().optional().default(""),
  PAYSTACK_TEST_PUBLIC_KEY: z.string().optional().default(""),
  PAYSTACK_LIVE_PUBLIC_KEY: z.string().optional().default(""),
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
  EMAIL_FROM: senderEmailSchema.optional().default(""),
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

const parsedEnv = envSchema.parse(process.env);
const resolvedMongoUri = resolveModeValue(parsedEnv.NODE_ENV, {
  shared: parsedEnv.MONGODB_URI,
  test: parsedEnv.MONGODB_TEST_URI,
  live: parsedEnv.MONGODB_LIVE_URI
});
const resolvedPaystackSecretKey = resolveModeValue(parsedEnv.NODE_ENV, {
  shared: parsedEnv.PAYSTACK_SECRET_KEY,
  test: parsedEnv.PAYSTACK_TEST_SECRET_KEY,
  live: parsedEnv.PAYSTACK_LIVE_SECRET_KEY
});
const resolvedPaystackWebhookSecret = resolveModeValue(parsedEnv.NODE_ENV, {
  shared: parsedEnv.PAYSTACK_WEBHOOK_SECRET,
  test: parsedEnv.PAYSTACK_TEST_WEBHOOK_SECRET,
  live: parsedEnv.PAYSTACK_LIVE_WEBHOOK_SECRET
});
const resolvedPaystackPublicKey = resolveModeValue(parsedEnv.NODE_ENV, {
  shared: parsedEnv.PAYSTACK_PUBLIC_KEY,
  test: parsedEnv.PAYSTACK_TEST_PUBLIC_KEY,
  live: parsedEnv.PAYSTACK_LIVE_PUBLIC_KEY
});

if (isBlank(resolvedMongoUri)) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_TEST_URI for development/test or MONGODB_LIVE_URI for production.");
}

export const env = {
  ...parsedEnv,
  MONGODB_URI: resolvedMongoUri,
  PAYSTACK_SECRET_KEY: resolvedPaystackSecretKey,
  PAYSTACK_WEBHOOK_SECRET: resolvedPaystackWebhookSecret,
  PAYSTACK_PUBLIC_KEY: resolvedPaystackPublicKey,
  PAYSTACK_MODE: parsedEnv.NODE_ENV === "production" ? ("live" as const) : ("test" as const),
  RESEND_FROM_EMAIL: parsedEnv.EMAIL_FROM || parsedEnv.RESEND_FROM_EMAIL
};
