import type { Request, Response } from "express";
import { pipeline } from "node:stream/promises";
import { AppError } from "@/errors";
import * as fileService from "@/services/file.service";
import { attachmentDisposition } from "@/utils";
import type {
  FileIdParams,
  MoveFileBody,
  PermanentDeleteFileBody,
  RenameFileBody,
  RestoreFileBody,
  TrashFileBody,
  UploadFileBody,
} from "@/validators";

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
  const result = await fileService.renameFile(
    user.id,
    req.body as RenameFileBody,
  );
  res.status(200).json({ status: "success", data: result });
}

export async function moveFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await fileService.moveFile(user.id, req.body as MoveFileBody);
  res.status(200).json({ status: "success", data: result });
}

export async function softDeleteFile(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { id } = req.body as TrashFileBody;
  const result = await fileService.softDeleteFile(user.id, id);
  res.status(200).json({ status: "success", data: result });
}

export async function restoreFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { id } = req.body as RestoreFileBody;
  const result = await fileService.restoreFile(user.id, id);
  res.status(200).json({ status: "success", data: result });
}

export async function permanentDeleteFile(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { id } = req.body as PermanentDeleteFileBody;
  const result = await fileService.permanentDeleteFile(user.id, id);
  res.status(200).json({ status: "success", data: result });
}

export async function downloadFile(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as FileIdParams;
  const download = await fileService.getFileForDownload(user.id, id);

  res.status(200);
  res.setHeader("Content-Type", download.mimeType || "application/octet-stream");
  res.setHeader("Content-Length", download.size.toString());
  res.setHeader("Content-Disposition", attachmentDisposition(download.name));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");

  try {
    await pipeline(download.stream, res);
  } catch (error) {
    if (!res.headersSent) {
      throw error;
    }
  }
}