import { prisma } from "@/prisma";

export const fileSelect = {
  id: true,
  name: true,
  extension: true,
  mime_type: true,
  storage_name: true,
  storage_path: true,
  size: true,
  folder_id: true,
  owner_id: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
} as const;

export async function create(data: {
  name: string;
  extension: string;
  mime_type: string;
  storage_name: string;
  storage_path: string;
  size: bigint;
  folder_id: string | null;
  owner_id: string;
}) {
  return prisma.file.create({
    data,
    select: fileSelect,
  });
}

export async function findOwnedById(owner_id: string, id: string) {
  return prisma.file.findFirst({
    where: { id, owner_id, deleted_at: null },
    select: fileSelect,
  });
}

export async function findByFolderIds(owner_id: string, folder_ids: string[]) {
  if (folder_ids.length === 0) return [];

  return prisma.file.findMany({
    where: {
      owner_id,
      folder_id: { in: folder_ids },
    },
    select: {
      id: true,
      storage_path: true,
    },
  });
}
