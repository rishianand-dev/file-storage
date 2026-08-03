import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/errors";
import { verifyAuthToken } from "@/utils";

/**
 * Requires `Authorization: Bearer <token>` and attaches `req.user`.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
