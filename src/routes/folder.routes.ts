import { Router } from "express";
import { createFolder } from "@/controllers/folder.controller";
import { authenticate, validate } from "@/middleware";
import { createFolderBodySchema } from "@/validators";

const folderRoutes = Router();

folderRoutes.post(
  "/",
  authenticate,
  validate({ body: createFolderBodySchema }),
  createFolder,
);

export default folderRoutes;
