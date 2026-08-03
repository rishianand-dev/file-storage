import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import healthRoutes from "@/routes/health.routes";
import meRoutes from "@/routes/me.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/me", meRoutes);

export default router;
