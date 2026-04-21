import { Router } from "express";
import {
  checkoutQuoteController,
  initializeCheckoutController,
  paystackWebhookController,
  verifyCheckoutController
} from "../controllers/checkout.controller";
import { optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import {
  checkoutQuoteSchema,
  initializeCheckoutSchema,
  verifyCheckoutSchema
} from "../validators/checkout.validator";

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
 * /checkout/quote:
 *   post:
 *     tags: [Checkout]
 *     summary: Calculate a server-side pricing quote
 * /checkout/webhook:
 *   post:
 *     tags: [Checkout]
 *     summary: Receive Paystack webhook events
 */
checkoutRouter.post("/quote", validate(checkoutQuoteSchema), asyncHandler(checkoutQuoteController));
checkoutRouter.post(
  "/initialize",
  optionalAuth,
  validate(initializeCheckoutSchema),
  asyncHandler(initializeCheckoutController)
);
checkoutRouter.post("/verify", validate(verifyCheckoutSchema), asyncHandler(verifyCheckoutController));
checkoutRouter.get("/verify/:reference", asyncHandler(verifyCheckoutController));
checkoutRouter.post("/webhook", asyncHandler(paystackWebhookController));
