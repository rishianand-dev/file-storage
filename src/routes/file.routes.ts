import { Router } from "express";
import { renameFile, uploadFile } from "@/controllers/file.controller";
import { authenticate, uploadSingleFile, validate } from "@/middleware";
import { renameFileBodySchema, uploadFileBodySchema } from "@/validators";

const fileRoutes = Router();

fileRoutes.post(
  "/",
  authenticate,
  uploadSingleFile,
  validate({ body: uploadFileBodySchema }),
  uploadFile,
);

fileRoutes.post(
  "/rename",
  authenticate,
  validate({ body: renameFileBodySchema }),
  renameFile,
)

export default fileRoutes;
