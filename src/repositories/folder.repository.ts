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
      parent_id: data.parent_id,
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

export async function softDeleteMany(ids: string[]) {
  if (ids.length === 0) return { count: 0 };

  return prisma.folder.updateMany({
    where: { id: { in: ids }, deleted_at: null },
    data: { deleted_at: new Date() },
  });
}

export async function hardDeleteMany(ids: string[]) {
  if (ids.length === 0) return { count: 0 };

  return prisma.folder.deleteMany({
    where: { id: { in: ids } },
  });
}
