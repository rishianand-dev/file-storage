import { prisma } from "@/prisma";

export async function findByTokenHash(token_hash: string) {
  return prisma.passwordResetToken.findUnique({
    where: { token_hash },
    select: {
      id: true,
      user_id: true,
      expires_at: true,
    },
  });
}

export async function replaceForUser(params: {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}) {
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { user_id: params.user_id },
    }),
    prisma.passwordResetToken.create({
      data: {
        token_hash: params.token_hash,
        user_id: params.user_id,
        expires_at: params.expires_at,
      },
    }),
  ]);
}

/**
 * Applies the new password, revokes all sessions, and consumes the reset token.
 */
export async function consumeAndResetPassword(params: {
  user_id: string;
  reset_token_id: string;
  hashed_password: string;
}) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.user_id },
      data: { hashed_password: params.hashed_password },
    }),
    prisma.refreshToken.updateMany({
      where: { user_id: params.user_id, revoked_at: null },
      data: { revoked_at: new Date() },
    }),
    prisma.passwordResetToken.delete({
      where: { id: params.reset_token_id },
    }),
  ]);
}
