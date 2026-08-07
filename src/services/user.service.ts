import { Prisma } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { userRepository } from "@/repositories";
import type { AuthUser } from "@/services/auth.service";
import type { UpdateMeBody } from "@/validators";

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await userRepository.findById(userId);

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
    const existing = await userRepository.findIdByEmail(email);
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
    return await userRepository.updateProfile(userId, data);
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
