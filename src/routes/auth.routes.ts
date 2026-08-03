import { Router } from "express";
import { login, register } from "@/controllers/auth.controller";
import { validate } from "@/middleware";
import { loginBodySchema, registerBodySchema } from "@/validators";

const authRoutes = Router();

// ── Credentials ──────────────────────────────────────────────
authRoutes.post("/register", validate({ body: registerBodySchema }), register);
authRoutes.post("/login", validate({ body: loginBodySchema }), login);

// ── OAuth (add later) ────────────────────────────────────────
// authRoutes.get("/google", ...);
// authRoutes.get("/google/callback", ...);
// authRoutes.get("/github", ...);
// authRoutes.get("/github/callback", ...);

export default authRoutes;
