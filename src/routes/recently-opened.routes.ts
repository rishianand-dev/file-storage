import { Router } from "express";
import {
  listRecentlyOpened,
  trackRecentlyOpened,
} from "@/controllers/recently-opened.controller";
import { authenticate, validate } from "@/middleware";
import {
  listRecentlyOpenedQuerySchema,
  trackRecentlyOpenedBodySchema,
} from "@/validators";

const recentlyOpenedRoutes = Router();

recentlyOpenedRoutes.use(authenticate);

recentlyOpenedRoutes.get(
  "/",
  validate({ query: listRecentlyOpenedQuerySchema }),
  listRecentlyOpened,
);

recentlyOpenedRoutes.post(
  "/",
  validate({ body: trackRecentlyOpenedBodySchema }),
  trackRecentlyOpened,
);

export default recentlyOpenedRoutes;
