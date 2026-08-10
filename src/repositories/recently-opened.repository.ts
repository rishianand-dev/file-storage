import { prisma } from "@/prisma";
import { fileSelect } from "@/repositories/file.repository";

export async function upsert(user_id: string, file_id: string) {
  return prisma.recentlyOpened.upsert({
    where: {
      user_id_file_id: { user_id, file_id },
    },
    create: {
      user_id,
      file_id,
      opened_at: new Date(),
    },
    update: {
      opened_at: new Date(),
    },
    select: {
      id: true,
      user_id: true,
      file_id: true,
      opened_at: true,
      file: { select: fileSelect },
    },
  });
}

export async function listByUser(user_id: string, limit: number) {
  return prisma.recentlyOpened.findMany({
    where: {
      user_id,
      file: { deleted_at: null },
    },
    orderBy: { opened_at: "desc" },
    take: limit,
    select: {
      id: true,
      user_id: true,
      file_id: true,
      opened_at: true,
      file: { select: fileSelect },
    },
  });
}
