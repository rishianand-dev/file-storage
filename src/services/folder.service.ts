import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { fileRepository, folderRepository } from "@/repositories";
import type { CreateFolderBody, RenameFolderBody } from "@/validators";

function mapUniqueNameConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      "A folder with this name already exists in this location",
      409,
    );
  }
  throw error;
}

async function collectFolderTreeIds(
  ownerId: string,
  rootId: string,
  options?: { includeDeleted?: boolean },
): Promise<string[]> {
  const ids = [rootId];
  const queue = [rootId];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const childIds = await folderRepository.findChildIds(
      ownerId,
      parentId,
      options?.includeDeleted ? { includeDeleted: true } : undefined,
    );

    for (const childId of childIds) {
      ids.push(childId);
      queue.push(childId);
    }
  }

  return ids;
}

export async function createFolder(ownerId: string, input: CreateFolderBody) {
  const parentId = input.parent_id ?? null;

  if (parentId) {
    const parent = await folderRepository.findOwnedById(ownerId, parentId);
    if (!parent) {
      throw new AppError("Parent folder not found", 404);
    }
  }

  try {
    return await folderRepository.create({
      name: input.name,
      owner_id: ownerId,
      parent_id: parentId,
    });
  } catch (error) {
    mapUniqueNameConflict(error);
  }
}

export async function renameFolder(
  ownerId: string,
  folderId: string,
  input: RenameFolderBody,
) {
  const folder = await folderRepository.findOwnedById(ownerId, folderId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  try {
    return await folderRepository.rename(folder.id, input.name);
  } catch (error) {
    mapUniqueNameConflict(error);
  }
}

/**
 * Soft-deletes a folder and cascades to nested folders and files.
 */
export async function softDeleteFolder(ownerId: string, folderId: string) {
  const folder = await folderRepository.findOwnedById(ownerId, folderId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  const folderIds = await collectFolderTreeIds(ownerId, folder.id);

  await fileRepository.softDeleteByFolderIds(ownerId, folderIds);
  await folderRepository.softDeleteMany(folderIds);

  return {
    id: folder.id,
    deleted_folders: folderIds.length,
  };
}

/**
 * Permanently deletes a soft-deleted folder (and its tree) from DB and disk.
 */
export async function permanentDeleteFolder(ownerId: string, folderId: string) {
  const folder = await folderRepository.findOwnedByIdIncludingDeleted(
    ownerId,
    folderId,
  );

  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  if (!folder.deleted_at) {
    throw new AppError("Soft-delete the folder before permanent delete", 400);
  }

  const folderIds = await collectFolderTreeIds(ownerId, folder.id, {
    includeDeleted: true,
  });

  const files = await fileRepository.findByFolderIds(ownerId, folderIds);

  await fileRepository.hardDeleteByIds(files.map((file) => file.id));
  await folderRepository.hardDeleteMany(folderIds);

  await Promise.all(
    files.map((file) =>
      fs
        .unlink(path.join(process.cwd(), file.storage_path))
        .catch(() => undefined),
    ),
  );

  return {
    id: folder.id,
    deleted_folders: folderIds.length,
    deleted_files: files.length,
  };
}
