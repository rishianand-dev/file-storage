import { env } from "@/config";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env.databaseUrl ?? (() => {
      throw new Error("DATABASE_URL is not set");
    })(),
  },
});
