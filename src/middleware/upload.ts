import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "@/errors";

const uploadRoot = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const ownerId = req.user?.id;
    if (!ownerId) {
      cb(new AppError("Authentication required", 401), "");
      return;
    }

    const dir = path.join(uploadRoot, ownerId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

/**
 * Expects field name `file`. Must run after `authenticate`.
 */
export const uploadSingleFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("file");
