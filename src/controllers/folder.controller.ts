import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as folderService from "@/services/folder.service";
import type { CreateFolderBody } from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function createFolder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await folderService.createFolder(
    user.id,
    req.body as CreateFolderBody,
  );
  res.status(201).json({ status: "success", data: result });
}
