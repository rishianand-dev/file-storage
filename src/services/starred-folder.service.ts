import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { folderRepository, starredFolderRepository } from "@/repositories";
import type {
  ListStarredFoldersQuery,
  StarFolderBody,
} from "@/validators";

export async function starFolder(userId: string, input: StarFolderBody) {
  const folder = await folderRepository.findOwnedById(userId, input.folder_id);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  return starredFolderRepository.upsert(userId, folder.id);
}

export async function unstarFolder(userId: string, folderId: string) {
  const folder = await folderRepository.findOwnedById(userId, folderId);
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  try {
    await starredFolderRepository.deleteByUserAndFolder(userId, folderId);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Folder is not starred", 404);
    }
    throw error;
  }

  return { folder_id: folderId };
}

export async function listStarredFolders(
  userId: string,
  query: ListStarredFoldersQuery,
) {
  return starredFolderRepository.listByUser(userId, query.limit);
}
