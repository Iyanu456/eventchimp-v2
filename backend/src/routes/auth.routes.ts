import { Router } from "express";
import {
  googleCallbackController,
  googleInitiateController,
  loginController,
  meController,
  registerController
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { googleCallbackSchema, loginSchema, registerSchema } from "../validators/auth.validator";

export const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new EventChimp user
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated profile
 *     security:
 *       - bearerAuth: []
 * /auth/google/initiate:
 *   get:
 *     tags: [Google OAuth]
 *     summary: Generate the Google OAuth consent URL
 * /auth/google/callback:
 *   post:
 *     tags: [Google OAuth]
 *     summary: Exchange a Google OAuth code for an EventChimp session
 */
authRouter.post("/register", validate(registerSchema), asyncHandler(registerController));
authRouter.post("/login", validate(loginSchema), asyncHandler(loginController));
authRouter.get("/me", requireAuth, asyncHandler(meController));
authRouter.get("/google/initiate", asyncHandler(googleInitiateController));
authRouter.post("/google/callback", validate(googleCallbackSchema), asyncHandler(googleCallbackController));
