import { Request, Response } from "express";
import { getBrandingTemplates, upsertBrandingMetadata } from "../services/branding.service";
import { apiResponse } from "../utils/api-response";

export const getBrandingTemplatesController = async (req: Request, res: Response) => {
  const payload = await getBrandingTemplates(req.user!, req.query.eventId as string | undefined);
  res.json(apiResponse(payload, "Branding templates fetched successfully"));
};

export const upsertBrandingMetadataController = async (req: Request, res: Response) => {
  const payload = await upsertBrandingMetadata(req.user!, req.body);
  res.status(201).json(apiResponse(payload, "Branding metadata saved successfully"));
};
