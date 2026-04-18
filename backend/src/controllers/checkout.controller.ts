import { Request, Response } from "express";
import { initializeCheckout, verifyCheckout } from "../services/checkout.service";
import { apiResponse } from "../utils/api-response";

export const initializeCheckoutController = async (req: Request, res: Response) => {
  const payload = await initializeCheckout(req.body.eventId, req.user!);
  res.status(201).json(apiResponse(payload, "Checkout initialized successfully"));
};

export const verifyCheckoutController = async (req: Request, res: Response) => {
  const payload = await verifyCheckout(req.body.reference);
  res.json(apiResponse(payload, "Checkout verified successfully"));
};

export const paystackWebhookController = async (_req: Request, res: Response) => {
  res.status(200).json({ received: true });
};
