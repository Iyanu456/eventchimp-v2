import { Router } from "express";
import { organizerDashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { asyncHandler } from "../utils/async-handler";

export const dashboardRouter = Router();

/**
 * @swagger
 * /dashboard/organizer:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get organizer dashboard metrics, events, and guest activity
 *     security:
 *       - bearerAuth: []
 */
dashboardRouter.get(
  "/organizer",
  requireAuth,
  requireRole("organizer", "admin"),
  asyncHandler(organizerDashboardController)
);
