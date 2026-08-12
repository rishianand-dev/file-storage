import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as fileService from "@/services/file.service";
import type { RenameFileBody, UploadFileBody } from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);

  if (!req.file) {
    throw new AppError("File is required", 400);
  }

  const result = await fileService.uploadFile(
    user.id,
    req.body as UploadFileBody,
    req.file,
  );

  res.status(201).json({ status: "success", data: result });
}


export async function renameFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await fileService.renameFile(user.id, req.body as RenameFileBody);
}