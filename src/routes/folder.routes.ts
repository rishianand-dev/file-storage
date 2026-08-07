import { Router } from "express";
import {
  createFolder,
  permanentDeleteFolder,
  renameFolder,
  softDeleteFolder,
} from "@/controllers/folder.controller";
import { authenticate, validate } from "@/middleware";
import {
  createFolderBodySchema,
  folderIdParamsSchema,
  renameFolderBodySchema,
} from "@/validators";

const folderRoutes = Router();

folderRoutes.post(
  "/",
  authenticate,
  validate({ body: createFolderBodySchema }),
  createFolder,
);

folderRoutes.patch(
  "/:id",
  authenticate,
  validate({ params: folderIdParamsSchema, body: renameFolderBodySchema }),
  renameFolder,
);

folderRoutes.delete(
  "/:id/permanent",
  authenticate,
  validate({ params: folderIdParamsSchema }),
  permanentDeleteFolder,
);

folderRoutes.delete(
  "/:id",
  authenticate,
  validate({ params: folderIdParamsSchema }),
  softDeleteFolder,
);

export default folderRoutes;
