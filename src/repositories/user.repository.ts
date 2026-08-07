import { Provider, type Prisma } from "@generated/prisma/client";
import { prisma } from "@/prisma";

export const authUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export type AuthUserRecord = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export async function findById(
  id: string,
  select: typeof authUserSelect = authUserSelect,
) {
  return prisma.user.findUnique({
    where: { id },
    select,
  });
}

export async function findByEmail<T extends Prisma.UserSelect>(
  email: string,
  select: T,
) {
  return prisma.user.findUnique({
    where: { email },
    select,
  });
}

export async function findIdByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
}

export async function createWithCredentials(data: {
  name: string;
  email: string;
  hashed_password: string;
}): Promise<AuthUserRecord> {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashed_password: data.hashed_password,
      accounts: {
        create: {
          provider_name: Provider.CREDENTIALS,
          provider_id: data.email,
        },
      },
    },
    select: authUserSelect,
  });
}

export async function updateProfile(
  id: string,
  data: {
    name?: string;
    email?: string;
    image?: string | null;
  },
): Promise<AuthUserRecord> {
  return prisma.user.update({
    where: { id },
    data,
    select: authUserSelect,
  });
}

export async function updatePassword(id: string, hashed_password: string) {
  return prisma.user.update({
    where: { id },
    data: { hashed_password },
  });
}
