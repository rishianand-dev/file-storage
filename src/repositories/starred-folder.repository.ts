import { prisma } from "@/prisma";
import { folderSelect } from "@/repositories/folder.repository";

export async function upsert(user_id: string, folder_id: string) {
  return prisma.starredFolder.upsert({
    where: {
      user_id_folder_id: { user_id, folder_id },
    },
    create: {
      user_id,
      folder_id,
      starred_at: new Date(),
    },
    update: {
      starred_at: new Date(),
    },
    select: {
      id: true,
      user_id: true,
      folder_id: true,
      starred_at: true,
      folder: { select: folderSelect },
    },
  });
}

export async function deleteByUserAndFolder(user_id: string, folder_id: string) {
  return prisma.starredFolder.delete({
    where: {
      user_id_folder_id: { user_id, folder_id },
    },
  });
}

export async function listByUser(user_id: string, limit: number) {
  return prisma.starredFolder.findMany({
    where: {
      user_id,
      folder: { deleted_at: null },
    },
    orderBy: { starred_at: "desc" },
    take: limit,
    select: {
      id: true,
      user_id: true,
      folder_id: true,
      starred_at: true,
      folder: { select: folderSelect },
    },
  });
}
