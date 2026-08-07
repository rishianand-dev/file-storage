import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as fileService from "@/services/file.service";
import type { CreateFileBody } from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function createFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);

  if (!req.file) {
    throw new AppError("File is required", 400);
  }

  const result = await fileService.createFile(
    user.id,
    req.body as CreateFileBody,
    req.file,
  );

  res.status(201).json({ status: "success", data: result });
}
