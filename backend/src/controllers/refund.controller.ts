import { Request, Response } from "express";
import { createRefund } from "../services/refund.service";
import { apiResponse } from "../utils/api-response";

export const createRefundController = async (req: Request, res: Response) => {
  const payload = await createRefund(req.user!, req.body);
  res.status(201).json(apiResponse(payload, "Refund created successfully"));
};
