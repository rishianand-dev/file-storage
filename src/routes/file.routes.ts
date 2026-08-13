import { Router } from "express";
import {
  downloadFile,
  moveFile,
  permanentDeleteFile,
  previewFile,
  renameFile,
  restoreFile,
  softDeleteFile,
  uploadFile,
} from "@/controllers/file.controller";
import { authenticate, uploadSingleFile, validate } from "@/middleware";
import {
  fileIdParamsSchema,
  moveFileBodySchema,
  permanentDeleteFileBodySchema,
  renameFileBodySchema,
  restoreFileBodySchema,
  trashFileBodySchema,
  uploadFileBodySchema,
} from "@/validators";

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
);

fileRoutes.patch(
  "/move",
  authenticate,
  validate({ body: moveFileBodySchema }),
  moveFile,
);

fileRoutes.patch(
  "/trash",
  authenticate,
  validate({ body: trashFileBodySchema }),
  softDeleteFile,
);

fileRoutes.patch(
  "/restore",
  authenticate,
  validate({ body: restoreFileBodySchema }),
  restoreFile,
);

fileRoutes.delete(
  "/permanent",
  authenticate,
  validate({ body: permanentDeleteFileBodySchema }),
  permanentDeleteFile,
);

fileRoutes.get(
  "/:id/preview",
  authenticate,
  validate({ params: fileIdParamsSchema }),
  previewFile,
);

fileRoutes.get(
  "/:id/download",
  authenticate,
  validate({ params: fileIdParamsSchema }),
  downloadFile,
);

export default fileRoutes;
