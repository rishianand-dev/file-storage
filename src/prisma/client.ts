import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client";
import { env } from "@/config/env";

const adapter = new PrismaPg({ connectionString: env.databaseUrl });

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}
