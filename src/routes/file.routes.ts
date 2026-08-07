import { Router } from "express";
import { createFile } from "@/controllers/file.controller";
import { authenticate, uploadSingleFile, validate } from "@/middleware";
import { createFileBodySchema } from "@/validators";

const fileRoutes = Router();

fileRoutes.post(
  "/",
  authenticate,
  uploadSingleFile,
  validate({ body: createFileBodySchema }),
  createFile,
);

export default fileRoutes;
