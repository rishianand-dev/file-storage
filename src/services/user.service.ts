import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { prisma } from "@/prisma";
import type { AuthUser } from "@/services/auth.service";
import type { UpdateMeBody } from "@/validators";

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateMe(
  userId: string,
  input: UpdateMeBody,
): Promise<AuthUser> {
  if (input.email !== undefined) {
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw new AppError("Email is already in use", 409);
    }
  }

  const data: {
    name?: string;
    email?: string;
    image?: string | null;
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email.toLowerCase();
  if (input.image !== undefined) data.image = input.image;

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("User not found", 404);
    }
    throw error;
  }
}
