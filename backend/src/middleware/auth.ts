import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

const applyUserFromAuthorization = (req: Request, authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.replace("Bearer ", "");
  const payload = verifyJwt(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name
  };

  return true;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required"
    });
  }

  applyUserFromAuthorization(req, authorization);
  next();
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next();
  }

  try {
    applyUserFromAuthorization(req, authorization);
  } catch {
    req.user = undefined;
  }

  next();
};
