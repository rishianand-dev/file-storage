import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import folderRoutes from "@/routes/folder.routes";
import healthRoutes from "@/routes/health.routes";
import meRoutes from "@/routes/me.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/folders", folderRoutes);

export default router;
