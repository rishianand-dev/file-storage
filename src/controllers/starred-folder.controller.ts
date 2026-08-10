import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as starredFolderService from "@/services/starred-folder.service";
import type {
  ListStarredFoldersQuery,
  StarFolderBody,
  StarredFolderParams,
} from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function starFolder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await starredFolderService.starFolder(
    user.id,
    req.body as StarFolderBody,
  );
  res.status(201).json({ status: "success", data: result });
}

export async function unstarFolder(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { folderId } = req.params as StarredFolderParams;
  const result = await starredFolderService.unstarFolder(user.id, folderId);
  res.status(200).json({ status: "success", data: result });
}

export async function listStarredFolders(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const result = await starredFolderService.listStarredFolders(
    user.id,
    req.query as unknown as ListStarredFoldersQuery,
  );
  res.status(200).json({ status: "success", data: result });
}
