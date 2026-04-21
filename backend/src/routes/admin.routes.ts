import { Router } from "express";
import {
  adminOrganizerReviewController,
  adminEventsController,
  adminOverviewController,
  adminTransactionsController,
  adminUsersController,
  suspendAdminEventController
} from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { suspendEventSchema } from "../validators/admin.validator";
import { organizerReviewSchema } from "../validators/organizer.validator";

export const adminRouter = Router();

/**
 * @swagger
 * /admin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin overview metrics
 *     security:
 *       - bearerAuth: []
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users
 *     security:
 *       - bearerAuth: []
 * /admin/events:
 *   get:
 *     tags: [Admin]
 *     summary: List events
 *     security:
 *       - bearerAuth: []
 * /admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: List transactions
 *     security:
 *       - bearerAuth: []
 */
adminRouter.use(requireAuth, requireRole("admin"));
adminRouter.get("/overview", asyncHandler(adminOverviewController));
adminRouter.get("/users", asyncHandler(adminUsersController));
adminRouter.get("/events", asyncHandler(adminEventsController));
adminRouter.get("/transactions", asyncHandler(adminTransactionsController));
adminRouter.patch("/events/:id/suspend", validate(suspendEventSchema), asyncHandler(suspendAdminEventController));
adminRouter.patch(
  "/organizers/:userId/review",
  validate(organizerReviewSchema),
  asyncHandler(adminOrganizerReviewController)
);
