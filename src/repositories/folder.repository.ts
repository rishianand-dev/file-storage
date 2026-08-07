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
