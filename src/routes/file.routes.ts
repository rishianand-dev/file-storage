import { Router } from "express";
import { uploadFile } from "@/controllers/file.controller";
import { authenticate, uploadSingleFile, validate } from "@/middleware";
import { uploadFileBodySchema } from "@/validators";

const fileRoutes = Router();

fileRoutes.post(
  "/",
  authenticate,
  uploadSingleFile,
  validate({ body: uploadFileBodySchema }),
  uploadFile,
);

export default fileRoutes;
