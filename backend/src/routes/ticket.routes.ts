import { Router } from "express";
import {
  checkInTicketController,
  getEventGuestListController,
  getMyTicketsController
} from "../controllers/ticket.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { asyncHandler } from "../utils/async-handler";

export const ticketRouter = Router();

/**
 * @swagger
 * /tickets/me:
 *   get:
 *     tags: [Tickets]
 *     summary: Get the authenticated user's tickets
 * /tickets/event/{eventId}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get an event guest list
 * /tickets/{ticketId}/check-in:
 *   patch:
 *     tags: [Tickets]
 *     summary: Check in a ticket
 */
ticketRouter.get("/me", requireAuth, asyncHandler(getMyTicketsController));
ticketRouter.get(
  "/event/:eventId",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(getEventGuestListController)
);
ticketRouter.patch(
  "/:ticketId/check-in",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(checkInTicketController)
);
