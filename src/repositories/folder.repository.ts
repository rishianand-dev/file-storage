import { prisma } from "@/prisma";

export const folderSelect = {
  id: true,
  name: true,
  parent_id: true,
  owner_id: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
} as const;

export async function findOwnedById(owner_id: string, id: string) {
  return prisma.folder.findFirst({
    where: { id, owner_id, deleted_at: null },
    select: folderSelect,
  });
}

export async function create(data: {
  name: string;
  owner_id: string;
  parent_id: string | null;
}) {
  return prisma.folder.create({
    data: {
      name: data.name,
      owner_id: data.owner_id,
      parent_id: data?.parent_id ?? null,
    },
    select: folderSelect,
  });
}

export async function rename(id: string, name: string) {
  return prisma.folder.update({
    where: { id },
    data: { name },
    select: folderSelect,
  });
}

export async function move(id: string, parent_id: string | null) {
  return prisma.folder.update({
    where: { id },
    data: { parent_id },
    select: folderSelect,
  });
}

export async function findOwnedByIdIncludingDeleted(
  owner_id: string,
  id: string,
) {
  return prisma.folder.findFirst({
    where: { id, owner_id },
    select: folderSelect,
  });
}

export async function findChildIds(
  owner_id: string,
  parent_id: string,
  options?: { includeDeleted?: boolean },
) {
  const folders = await prisma.folder.findMany({
    where: {
      owner_id,
      parent_id,
      ...(options?.includeDeleted ? {} : { deleted_at: null }),
    },
    select: { id: true },
  });

  return folders.map((folder) => folder.id);
}

/**
 * Soft-deletes folders and their files in one transaction.
 */
export async function softDeleteTree(owner_id: string, folder_ids: string[]) {
  if (folder_ids.length === 0) return;

  const deleted_at = new Date();

  await prisma.$transaction([
    prisma.file.updateMany({
      where: {
        owner_id,
        folder_id: { in: folder_ids },
        deleted_at: null,
      },
      data: { deleted_at },
    }),
    prisma.folder.updateMany({
      where: { id: { in: folder_ids }, deleted_at: null },
      data: { deleted_at },
    }),
  ]);
}

/**
 * Permanently deletes files then folders in one transaction.
 */
export async function hardDeleteTree(folder_ids: string[], file_ids: string[]) {
  if (folder_ids.length === 0 && file_ids.length === 0) return;

  await prisma.$transaction(async (tx) => {
    if (file_ids.length > 0) {
      await tx.file.deleteMany({
        where: { id: { in: file_ids } },
      });
    }

    if (folder_ids.length > 0) {
      await tx.folder.deleteMany({
        where: { id: { in: folder_ids } },
      });
    }
  });
}
