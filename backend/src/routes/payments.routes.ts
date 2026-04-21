import { Router } from "express";
import {
  createPaymentCheckoutController,
  paystackWebhookController,
  verifyPaymentController
} from "../controllers/payment.controller";
import { checkoutQuoteController } from "../controllers/checkout.controller";
import { optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import {
  checkoutQuoteSchema,
  initializeCheckoutSchema,
  verifyCheckoutSchema
} from "../validators/checkout.validator";

export const paymentsRouter = Router();

paymentsRouter.post("/quote", validate(checkoutQuoteSchema), asyncHandler(checkoutQuoteController));
paymentsRouter.post(
  "/checkout",
  optionalAuth,
  validate(initializeCheckoutSchema),
  asyncHandler(createPaymentCheckoutController)
);
paymentsRouter.get("/verify/:reference", asyncHandler(verifyPaymentController));
paymentsRouter.post("/verify", validate(verifyCheckoutSchema), asyncHandler(verifyPaymentController));
paymentsRouter.post("/webhook", asyncHandler(paystackWebhookController));
