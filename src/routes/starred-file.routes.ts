import { Router } from "express";
import {
  listStarredFiles,
  starFile,
  unstarFile,
} from "@/controllers/starred-file.controller";
import { authenticate, validate } from "@/middleware";
import {
  listStarredFilesQuerySchema,
  starFileBodySchema,
  starredFileParamsSchema,
} from "@/validators";

const starredFileRoutes = Router();

starredFileRoutes.use(authenticate);

starredFileRoutes.get(
  "/",
  validate({ query: listStarredFilesQuerySchema }),
  listStarredFiles,
);

starredFileRoutes.post(
  "/",
  validate({ body: starFileBodySchema }),
  starFile,
);

starredFileRoutes.delete(
  "/:fileId",
  validate({ params: starredFileParamsSchema }),
  unstarFile,
);

export default starredFileRoutes;
