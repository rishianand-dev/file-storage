import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { fileRepository, starredFileRepository } from "@/repositories";
import type { ListStarredFilesQuery, StarFileBody } from "@/validators";

function toFileResponse<T extends { size: bigint }>(file: T) {
  return {
    ...file,
    size: file.size.toString(),
  };
}

function toStarredFileResponse<T extends { file: { size: bigint } }>(item: T) {
  return {
    ...item,
    file: toFileResponse(item.file),
  };
}

export async function starFile(userId: string, input: StarFileBody) {
  const file = await fileRepository.findOwnedById(userId, input.file_id);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const starred = await starredFileRepository.upsert(userId, file.id);
  return toStarredFileResponse(starred);
}

export async function unstarFile(userId: string, fileId: string) {
  const file = await fileRepository.findOwnedById(userId, fileId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  try {
    await starredFileRepository.deleteByUserAndFile(userId, fileId);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("File is not starred", 404);
    }
    throw error;
  }

  return { file_id: fileId };
}

export async function listStarredFiles(
  userId: string,
  query: ListStarredFilesQuery,
) {
  const items = await starredFileRepository.listByUser(userId, query.limit);
  return items.map(toStarredFileResponse);
}
