import { prisma } from "@/prisma";
import { fileSelect } from "@/repositories/file.repository";

export async function upsert(user_id: string, file_id: string) {
  return prisma.starredFile.upsert({
    where: {
      user_id_file_id: { user_id, file_id },
    },
    create: {
      user_id,
      file_id,
      starred_at: new Date(),
    },
    update: {
      starred_at: new Date(),
    },
    select: {
      id: true,
      user_id: true,
      file_id: true,
      starred_at: true,
      file: { select: fileSelect },
    },
  });
}

export async function deleteByUserAndFile(user_id: string, file_id: string) {
  return prisma.starredFile.delete({
    where: {
      user_id_file_id: { user_id, file_id },
    },
  });
}

export async function listByUser(user_id: string, limit: number) {
  return prisma.starredFile.findMany({
    where: {
      user_id,
      file: { deleted_at: null },
    },
    orderBy: { starred_at: "desc" },
    take: limit,
    select: {
      id: true,
      user_id: true,
      file_id: true,
      starred_at: true,
      file: { select: fileSelect },
    },
  });
}
