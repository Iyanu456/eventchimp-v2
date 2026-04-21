import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/enums";

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const normalizedRole =
      req.user?.role === "attendee" && roles.includes("organizer")
        ? "organizer"
        : req.user?.role;

    if (!req.user || !normalizedRole || !roles.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource"
      });
    }

    next();
  };
