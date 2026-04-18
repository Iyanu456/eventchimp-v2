import { Request, Response } from "express";
import { getOwnProfile, loginUser, registerUser, upsertGoogleUser } from "../services/auth.service";
import { exchangeGoogleCode, getGoogleAuthUrl } from "../services/google-oauth.service";
import { apiResponse } from "../utils/api-response";

export const registerController = async (req: Request, res: Response) => {
  const payload = await registerUser(req.body);
  res.status(201).json(apiResponse(payload, "Account created successfully"));
};

export const loginController = async (req: Request, res: Response) => {
  const payload = await loginUser(req.body.email, req.body.password);
  res.json(apiResponse(payload, "Login successful"));
};

export const meController = async (req: Request, res: Response) => {
  const payload = await getOwnProfile(req.user!.id);
  res.json(apiResponse(payload, "Profile fetched successfully"));
};

export const googleInitiateController = async (_req: Request, res: Response) => {
  const authUrl = getGoogleAuthUrl();
  res.json(apiResponse({ authUrl }, "Google auth URL created"));
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const profile = await exchangeGoogleCode(req.body.code);
  const payload = await upsertGoogleUser(profile);
  res.json(apiResponse(payload, "Google authentication completed"));
};
