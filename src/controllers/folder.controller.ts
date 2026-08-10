import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as folderService from "@/services/folder.service";
import type {
  CreateFolderBody,
  FolderIdParams,
  MoveFolderBody,
  RenameFolderBody,
} from "@/validators";

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

export async function renameFolder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as FolderIdParams;
  const result = await folderService.renameFolder(
    user.id,
    id,
    req.body as RenameFolderBody,
  );
  res.status(200).json({ status: "success", data: result });
}

export async function moveFolder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as FolderIdParams;
  const result = await folderService.moveFolder(
    user.id,
    id,
    req.body as MoveFolderBody,
  );
  res.status(200).json({ status: "success", data: result });
}

export async function softDeleteFolder(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as FolderIdParams;
  const result = await folderService.softDeleteFolder(user.id, id);
  res.status(200).json({ status: "success", data: result });
}

export async function permanentDeleteFolder(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const { id } = req.params as FolderIdParams;
  const result = await folderService.permanentDeleteFolder(user.id, id);
  res.status(200).json({ status: "success", data: result });
}
