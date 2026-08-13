import { Router } from "express";
import {
  createFolder,
  moveFolder,
  permanentDeleteFolder,
  renameFolder,
  softDeleteFolder,
} from "@/controllers/folder.controller";
import { authenticate, validate } from "@/middleware";
import {
  createFolderBodySchema,
  folderIdParamsSchema,
  moveFolderBodySchema,
  permanentDeleteFolderBodySchema,
  renameFolderBodySchema,
  trashFolderBodySchema,
} from "@/validators";

const folderRoutes = Router();

folderRoutes.post(
  "/",
  authenticate,
  validate({ body: createFolderBodySchema }),
  createFolder,
);

folderRoutes.patch(
  "/trash",
  authenticate,
  validate({ body: trashFolderBodySchema }),
  softDeleteFolder,
);

folderRoutes.delete(
  "/permanent",
  authenticate,
  validate({ body: permanentDeleteFolderBodySchema }),
  permanentDeleteFolder,
);

folderRoutes.patch(
  "/:id/move",
  authenticate,
  validate({ params: folderIdParamsSchema, body: moveFolderBodySchema }),
  moveFolder,
);

folderRoutes.patch(
  "/:id",
  authenticate,
  validate({ params: folderIdParamsSchema, body: renameFolderBodySchema }),
  renameFolder,
);

export default folderRoutes;
