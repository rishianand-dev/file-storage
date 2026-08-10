import { Router } from "express";
import {
  listStarredFolders,
  starFolder,
  unstarFolder,
} from "@/controllers/starred-folder.controller";
import { authenticate, validate } from "@/middleware";
import {
  listStarredFoldersQuerySchema,
  starFolderBodySchema,
  starredFolderParamsSchema,
} from "@/validators";

const starredFolderRoutes = Router();

starredFolderRoutes.use(authenticate);

starredFolderRoutes.get(
  "/",
  validate({ query: listStarredFoldersQuerySchema }),
  listStarredFolders,
);

starredFolderRoutes.post(
  "/",
  validate({ body: starFolderBodySchema }),
  starFolder,
);

starredFolderRoutes.delete(
  "/:folderId",
  validate({ params: starredFolderParamsSchema }),
  unstarFolder,
);

export default starredFolderRoutes;
