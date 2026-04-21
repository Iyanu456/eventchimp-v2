import { Request, Response } from "express";
import { getCheckoutQuote, initializeCheckout, verifyCheckout } from "../services/checkout.service";
import { receivePaystackWebhook } from "../services/webhook.service";
import { apiResponse } from "../utils/api-response";

export const checkoutQuoteController = async (req: Request, res: Response) => {
  const payload = await getCheckoutQuote(req.body);
  res.json(apiResponse(payload, "Checkout quote fetched successfully"));
};

export const initializeCheckoutController = async (req: Request, res: Response) => {
  const payload = await initializeCheckout(req.body, req.user);
  res.status(201).json(apiResponse(payload, "Checkout initialized successfully"));
};

export const verifyCheckoutController = async (req: Request, res: Response) => {
  const payload = await verifyCheckout(String(req.body.reference ?? req.params.reference));
  res.json(apiResponse(payload, "Checkout verified successfully"));
};

export const paystackWebhookController = async (req: Request, res: Response) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
  const payload = JSON.parse(rawBody.toString("utf8"));
  await receivePaystackWebhook(payload, rawBody, req.headers["x-paystack-signature"] as string | undefined);
  res.status(200).json({ received: true });
};
