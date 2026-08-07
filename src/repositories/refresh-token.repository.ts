import { prisma } from "@/prisma";
import { authUserSelect } from "@/repositories/user.repository";

export async function create(data: {
  token_hash: string;
  user_id: string;
  expires_at: Date;
}) {
  return prisma.refreshToken.create({
    data,
  });
}

export async function findByTokenHash(token_hash: string) {
  return prisma.refreshToken.findUnique({
    where: { token_hash },
    select: {
      id: true,
      user_id: true,
      expires_at: true,
      revoked_at: true,
      user: { select: authUserSelect },
    },
  });
}

export async function revokeById(id: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revoked_at: new Date() },
  });
}

export async function revokeAllForUser(user_id: string) {
  return prisma.refreshToken.updateMany({
    where: { user_id, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export async function revokeByTokenHash(token_hash: string) {
  return prisma.refreshToken.updateMany({
    where: { token_hash, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export async function rotate(params: {
  oldTokenId: string;
  user_id: string;
  new_token_hash: string;
  expires_at: Date;
}) {
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: params.oldTokenId },
      data: { revoked_at: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        token_hash: params.new_token_hash,
        user_id: params.user_id,
        expires_at: params.expires_at,
      },
    }),
  ]);
}
