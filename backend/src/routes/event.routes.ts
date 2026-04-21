import { Router } from "express";
import {
  createEventController,
  createEventMessageController,
  deleteEventController,
  getEventBySlugController,
  getEventMessagesController,
  getEventsController,
  getFeaturedEventsController,
  updateEventController
} from "../controllers/event.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { eventMessageSchema, eventSchema, eventUpdateSchema } from "../validators/event.validator";

export const eventRouter = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: Browse published events
 *   post:
 *     tags: [Events]
 *     summary: Create an event as an organizer
 *     security:
 *       - bearerAuth: []
 * /events/featured:
 *   get:
 *     tags: [Events]
 *     summary: Get trending and featured events
 * /events/slug/{slug}:
 *   get:
 *     tags: [Events]
 *     summary: Get one event by slug
 * /events/{id}/messages:
 *   get:
 *     tags: [Events]
 *     summary: Get event wall posts
 *   post:
 *     tags: [Events]
 *     summary: Create a new event wall post
 */
eventRouter.get("/", asyncHandler(getEventsController));
eventRouter.get("/featured", asyncHandler(getFeaturedEventsController));
eventRouter.get("/slug/:slug", asyncHandler(getEventBySlugController));
eventRouter.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  upload.single("coverImage"),
  validate(eventSchema),
  asyncHandler(createEventController)
);
eventRouter.patch(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  upload.single("coverImage"),
  validate(eventUpdateSchema),
  asyncHandler(updateEventController)
);
eventRouter.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(deleteEventController)
);
eventRouter.get("/:id/messages", asyncHandler(getEventMessagesController));
eventRouter.post("/:id/messages", validate(eventMessageSchema), asyncHandler(createEventMessageController));
