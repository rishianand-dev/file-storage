import path from "node:path";
import type { Readable } from "node:stream";
import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { fileRepository, folderRepository } from "@/repositories";
import { objectStorage } from "@/storage";
import type { MoveFileBody, RenameFileBody, UploadFileBody } from "@/validators";

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

function mapUniqueNameConflict(error: unknown): never {
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

export async function uploadFile(
  ownerId: string,
  input: UploadFileBody,
  uploaded: UploadedFile,
) {
  const folderId = input.folder_id ?? null;

  if (folderId) {
    const folder = await folderRepository.findOwnedById(ownerId, folderId);
    if (!folder) {
      await objectStorage.delete(uploaded.filename);
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
    await objectStorage.delete(uploaded.filename);
    mapUniqueNameConflict(error);
  }
}

export async function renameFile(ownerId: string, input: RenameFileBody) {
  try {
    if (input.name.length > 255) {
      throw new AppError("Name is too long", 400);
    }
    const file = await fileRepository.findOwnedById(ownerId, input.file_id);
    if (!file) {
      throw new AppError("File not found", 404);
    }

    const requestedExtension = path.extname(input.name).replace(/^\./, "");
    let newName = input.name;

    if (!requestedExtension) {
      newName = file.extension ? `${input.name}.${file.extension}` : input.name;
    } else if (requestedExtension.toLowerCase() !== file.extension.toLowerCase()) {
      throw new AppError("File extension cannot be changed", 400);
    }

    if (newName.length > 255) {
      throw new AppError("Name is too long", 400);
    }

    const updated = await fileRepository.update(file.id, { name: newName });

    return toFileResponse(updated);
  } catch (error) {
    mapUniqueNameConflict(error);
  }
}

/**
 * Moves a file to another folder (or root when folder_id is null).
 */
export async function moveFile(ownerId: string, input: MoveFileBody) {
  const file = await fileRepository.findOwnedById(ownerId, input.id);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const folderId = input.folder_id;

  if (folderId !== null) {
    const folder = await folderRepository.findOwnedById(ownerId, folderId);
    if (!folder) {
      throw new AppError("Folder not found", 404);
    }
  }

  if (file.folder_id === folderId) {
    throw new AppError("File is already in this location", 400);
  }

  try {
    const updated = await fileRepository.update(file.id, {
      folder_id: folderId,
    });
    return toFileResponse(updated);
  } catch (error) {
    mapUniqueNameConflict(error);
  }
}

/**
 * Soft-deletes a file (moves to trash). Disk file is kept until permanent delete.
 */
export async function softDeleteFile(ownerId: string, fileId: string) {
  const file = await fileRepository.findOwnedById(ownerId, fileId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const deleted = await fileRepository.softDelete(file.id);
  return toFileResponse(deleted);
}

/**
 * Restores a soft-deleted file from trash.
 * If its parent folder is missing or trashed, restores to root.
 */
export async function restoreFile(ownerId: string, fileId: string) {
  const file = await fileRepository.findOwnedByIdIncludingDeleted(
    ownerId,
    fileId,
  );

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (!file.deleted_at) {
    throw new AppError("File is not in trash", 400);
  }

  let folderId = file.folder_id;
  if (folderId) {
    const folder = await folderRepository.findOwnedById(ownerId, folderId);
    if (!folder) {
      folderId = null;
    }
  }

  try {
    const restored = await fileRepository.restore(file.id, {
      folder_id: folderId,
    });
    return toFileResponse(restored);
  } catch (error) {
    mapUniqueNameConflict(error);
  }
}

/**
 * Permanently deletes a soft-deleted file from DB and disk.
 */
export async function permanentDeleteFile(ownerId: string, fileId: string) {
  const file = await fileRepository.findOwnedByIdIncludingDeleted(
    ownerId,
    fileId,
  );

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (!file.deleted_at) {
    throw new AppError("Soft-delete the file before permanent delete", 400);
  }

  await fileRepository.hardDelete(file.id);
  await objectStorage.delete(file.storage_name);

  return { id: file.id };
}

export type FileDownload = {
  name: string;
  mimeType: string;
  size: bigint;
  stream: Readable;
};

/**
 * Ownership + trash + physical existence. Returns a readable stream of bytes.
 * Controller only sets headers and pipes the stream.
 */
export async function getFileForDownload(
  ownerId: string,
  fileId: string,
): Promise<FileDownload> {
  const file = await fileRepository.findOwnedById(ownerId, fileId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const exists = await objectStorage.exists(file.storage_name);
  if (!exists) {
    throw new AppError("File not found", 404);
  }

  return {
    name: file.name,
    mimeType: file.mime_type,
    size: file.size,
    stream: objectStorage.getReadStream(file.storage_name),
  };
}
