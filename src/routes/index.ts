import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import fileRoutes from "@/routes/file.routes";
import folderRoutes from "@/routes/folder.routes";
import healthRoutes from "@/routes/health.routes";
import meRoutes from "@/routes/me.routes";
import recentlyOpenedRoutes from "@/routes/recently-opened.routes";
import starredFolderRoutes from "@/routes/starred-folder.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/folders", folderRoutes);
router.use("/files", fileRoutes);
router.use("/recently-opened", recentlyOpenedRoutes);
router.use("/starred-folders", starredFolderRoutes);

export default router;
