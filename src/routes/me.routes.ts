import { Router } from "express";
import { getMe, updateMe } from "@/controllers/me.controller";
import { authenticate, validate } from "@/middleware";
import { updateMeBodySchema } from "@/validators";

const meRoutes = Router();

meRoutes.get("/", authenticate, getMe);
meRoutes.patch("/", authenticate, validate({ body: updateMeBodySchema }), updateMe);

export default meRoutes;
