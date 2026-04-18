import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required"
    });
  }

  const token = authorization.replace("Bearer ", "");
  const payload = verifyJwt(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name
  };

  next();
};
