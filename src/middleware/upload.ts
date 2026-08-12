import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "@/errors";

const uploadRoot = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    if (!req.user?.id) {
      cb(new AppError("Authentication required", 401), "");
      return;
    }

    fs.mkdirSync(uploadRoot, { recursive: true });
    cb(null, uploadRoot);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadSingleFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("file");
