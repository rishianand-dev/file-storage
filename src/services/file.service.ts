import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { fileRepository, folderRepository } from "@/repositories";
import type { RenameFileBody, UploadFileBody } from "@/validators";
import { randomUUID } from "node:crypto";

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  filename: string;
  size: number;
  path: string;
};

function toFileResponse<T extends { size: bigint }>(file: T) {
  return {
    ...file,
    size: file.size.toString(),
  };
}

export async function uploadFile(
  ownerId: string,
  input: UploadFileBody,
  uploaded: UploadedFile,
) {
  const folderId = input.folder_id ?? null;

  if (folderId) {
    const folder = await folderRepository.findOwnedById(ownerId, folderId);
    if (!folder) {
      await fs.unlink(uploaded.path).catch(() => undefined);
      throw new AppError("Folder not found", 404);
    }
  }

  const extension = path.extname(uploaded.originalname).replace(/^\./, "");
  const storage_name = uploaded.filename;
  const storage_path = path.join("uploads", storage_name);

  try {
    const file = await fileRepository.create({
      name: uploaded.originalname,
      extension,
      mime_type: uploaded.mimetype,
      storage_name,
      storage_path,
      size: BigInt(uploaded.size),
      folder_id: folderId,
      owner_id: ownerId,
    });

    return toFileResponse(file);
  } catch (error) {
    await fs.unlink(uploaded.path).catch(() => undefined);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "A file with this name already exists in this location",
        409,
      );
    }
    throw error;
  }
}

export async function renameFile(ownerId: string, input: RenameFileBody) {
  try {
    if(input.name.length > 255) {
      throw new AppError("Name is too long", 400);
    }
    const file = await fileRepository.findOwnedById(ownerId, input.file_id);
    if (!file) {
      throw new AppError("File not found", 404);
    }

    const newName = input.name;
    const newExtension = path.extname(newName).replace(/^\./, "");
    const newStorageName = `${randomUUID()}${newExtension}`;
    const newStoragePath = path.join("uploads", newStorageName);

    await fileRepository.update(file.id, {
      name: newName,
      extension: newExtension,
      storage_name: newStorageName,
      storage_path: newStoragePath,
    });

    return toFileResponse(file);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "A file with this name already exists in this location",
        409,
      );
    }
    throw error;
  }
}
