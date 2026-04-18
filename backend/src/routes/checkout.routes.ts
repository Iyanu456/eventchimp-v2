import { Router } from "express";
import {
  initializeCheckoutController,
  paystackWebhookController,
  verifyCheckoutController
} from "../controllers/checkout.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { initializeCheckoutSchema, verifyCheckoutSchema } from "../validators/checkout.validator";

export const checkoutRouter = Router();

/**
 * @swagger
 * /checkout/initialize:
 *   post:
 *     tags: [Checkout]
 *     summary: Initialize a Paystack checkout session
 *     security:
 *       - bearerAuth: []
 * /checkout/verify:
 *   post:
 *     tags: [Checkout]
 *     summary: Verify checkout and issue a ticket
 *     security:
 *       - bearerAuth: []
 * /checkout/webhook:
 *   post:
 *     tags: [Checkout]
 *     summary: Receive Paystack webhook events
 */
checkoutRouter.post(
  "/initialize",
  requireAuth,
  validate(initializeCheckoutSchema),
  asyncHandler(initializeCheckoutController)
);
checkoutRouter.post(
  "/verify",
  requireAuth,
  validate(verifyCheckoutSchema),
  asyncHandler(verifyCheckoutController)
);
checkoutRouter.post("/webhook", asyncHandler(paystackWebhookController));
