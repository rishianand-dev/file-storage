import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as userService from "@/services/user.service";
import type { UpdateMeBody } from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await userService.getMe(user.id);
  res.status(200).json({ status: "success", data: result });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await userService.updateMe(user.id, req.body as UpdateMeBody);
  res.status(200).json({ status: "success", data: result });
}
