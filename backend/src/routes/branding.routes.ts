import { Router } from "express";
import {
  getBrandingTemplatesController,
  upsertBrandingMetadataController
} from "../controllers/branding.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { brandingMetadataSchema } from "../validators/branding.validator";

export const brandingRouter = Router();

/**
 * @swagger
 * /branding/templates:
 *   get:
 *     tags: [Branding Kit]
 *     summary: Get branding kit previews for organizer events
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Branding Kit]
 *     summary: Upsert branding asset metadata
 *     security:
 *       - bearerAuth: []
 */
brandingRouter.get(
  "/templates",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(getBrandingTemplatesController)
);
brandingRouter.post(
  "/templates",
  requireAuth,
  requireRole("organizer", "admin"),
  validate(brandingMetadataSchema),
  asyncHandler(upsertBrandingMetadataController)
);
