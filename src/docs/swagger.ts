import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "@/docs/openapi";

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
}
