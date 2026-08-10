import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as recentlyOpenedService from "@/services/recently-opened.service";
import type {
  ListRecentlyOpenedQuery,
  TrackRecentlyOpenedBody,
} from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function trackRecentlyOpened(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const result = await recentlyOpenedService.trackRecentlyOpened(
    user.id,
    req.body as TrackRecentlyOpenedBody,
  );
  res.status(200).json({ status: "success", data: result });
}

export async function listRecentlyOpened(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const result = await recentlyOpenedService.listRecentlyOpened(
    user.id,
    req.query as unknown as ListRecentlyOpenedQuery,
  );
  res.status(200).json({ status: "success", data: result });
}
