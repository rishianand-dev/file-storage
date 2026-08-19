import type { Request, Response } from "express";
import { AppError } from "@/errors";
import * as starredFileService from "@/services/starred-file.service";
import type {
  ListStarredFilesQuery,
  StarFileBody,
  StarredFileParams,
} from "@/validators";

function requireUser(req: Request): { id: string; email: string } {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user;
}

export async function starFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const result = await starredFileService.starFile(
    user.id,
    req.body as StarFileBody,
  );
  res.status(201).json({ status: "success", data: result });
}

export async function unstarFile(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const { fileId } = req.params as StarredFileParams;
  const result = await starredFileService.unstarFile(user.id, fileId);
  res.status(200).json({ status: "success", data: result });
}

export async function listStarredFiles(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req);
  const result = await starredFileService.listStarredFiles(
    user.id,
    req.query as unknown as ListStarredFilesQuery,
  );
  res.status(200).json({ status: "success", data: result });
}
