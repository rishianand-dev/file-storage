import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from "@/controllers/auth.controller";
import { validate } from "@/middleware";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from "@/validators";

const authRoutes = Router();

// ── Credentials ──────────────────────────────────────────────
authRoutes.post("/register", validate({ body: registerBodySchema }), register);
authRoutes.post("/login", validate({ body: loginBodySchema }), login);
authRoutes.post("/refresh", validate({ body: refreshBodySchema }), refresh);
authRoutes.post("/logout", validate({ body: refreshBodySchema }), logout);
authRoutes.post(
  "/forgot-password",
  validate({ body: forgotPasswordBodySchema }),
  forgotPassword,
);
authRoutes.post(
  "/reset-password",
  validate({ body: resetPasswordBodySchema }),
  resetPassword,
);

// ── OAuth (add later) ────────────────────────────────────────
// authRoutes.get("/google", ...);
// authRoutes.get("/google/callback", ...);
// authRoutes.get("/github", ...);
// authRoutes.get("/github/callback", ...);

export default authRoutes;
