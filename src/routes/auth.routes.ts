import { Router } from "express";
import { login, logout, refresh, register } from "@/controllers/auth.controller";
import { validate } from "@/middleware";
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "@/validators";

const authRoutes = Router();

// ── Credentials ──────────────────────────────────────────────
authRoutes.post("/register", validate({ body: registerBodySchema }), register);
authRoutes.post("/login", validate({ body: loginBodySchema }), login);
authRoutes.post("/refresh", validate({ body: refreshBodySchema }), refresh);
authRoutes.post("/logout", validate({ body: refreshBodySchema }), logout);

// ── OAuth (add later) ────────────────────────────────────────
// authRoutes.get("/google", ...);
// authRoutes.get("/google/callback", ...);
// authRoutes.get("/github", ...);
// authRoutes.get("/github/callback", ...);

export default authRoutes;
