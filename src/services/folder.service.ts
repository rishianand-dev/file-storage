import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { folderRepository } from "@/repositories";
import type { CreateFolderBody } from "@/validators";

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
}
