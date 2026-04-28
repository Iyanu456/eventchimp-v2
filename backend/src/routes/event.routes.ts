import { Router } from "express";
import {
  acceptEventInvitationController,
  checkInEventTicketController,
  getEventMetricsController,
  inviteEventCollaboratorController,
  listEventCollaboratorsController,
  scanEventTicketController,
  updateEventSettingsController
} from "../controllers/event-operations.controller";
import {
  createEventController as createEventPrimaryController,
  createEventMessageController as createEventMessagePrimaryController,
  deleteEventController as deleteEventPrimaryController,
  getEventBySlugController as getEventBySlugPrimaryController,
  getEventMessagesController as getEventMessagesPrimaryController,
  getEventsController as getEventsPrimaryController,
  getFeaturedEventsController as getFeaturedEventsPrimaryController,
  updateEventController as updateEventPrimaryController
} from "../controllers/event.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { eventMessageSchema, eventSchema, eventUpdateSchema } from "../validators/event.validator";
import { eventSettingsSchema, inviteCollaboratorSchema, scanTicketSchema } from "../validators/event-operations.validator";

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
eventRouter.get("/", asyncHandler(getEventsPrimaryController));
eventRouter.get("/featured", asyncHandler(getFeaturedEventsPrimaryController));
eventRouter.get("/slug/:slug", asyncHandler(getEventBySlugPrimaryController));
eventRouter.post(
  "/",
  requireAuth,
  requireRole("organizer", "admin"),
  upload.single("coverImage"),
  validate(eventSchema),
  asyncHandler(createEventPrimaryController)
);
eventRouter.patch(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  upload.single("coverImage"),
  validate(eventUpdateSchema),
  asyncHandler(updateEventPrimaryController)
);
eventRouter.delete(
  "/:id",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(deleteEventPrimaryController)
);
eventRouter.get("/:id/messages", asyncHandler(getEventMessagesPrimaryController));
eventRouter.post("/:id/messages", validate(eventMessageSchema), asyncHandler(createEventMessagePrimaryController));
eventRouter.get("/:eventId/collaborators", requireAuth, asyncHandler(listEventCollaboratorsController));
eventRouter.post(
  "/:eventId/collaborators/invite",
  requireAuth,
  validate(inviteCollaboratorSchema),
  asyncHandler(inviteEventCollaboratorController)
);
eventRouter.post("/invitations/:token/accept", requireAuth, asyncHandler(acceptEventInvitationController));
eventRouter.get("/:eventId/metrics", requireAuth, asyncHandler(getEventMetricsController));
eventRouter.patch(
  "/:eventId/settings",
  requireAuth,
  validate(eventSettingsSchema),
  asyncHandler(updateEventSettingsController)
);
eventRouter.post(
  "/:eventId/tickets/scan",
  requireAuth,
  validate(scanTicketSchema),
  asyncHandler(scanEventTicketController)
);
eventRouter.post(
  "/:eventId/tickets/check-in",
  requireAuth,
  validate(scanTicketSchema),
  asyncHandler(checkInEventTicketController)
);
