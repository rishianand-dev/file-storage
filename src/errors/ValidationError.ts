import type { ZodError } from "zod";
import { AppError } from "@/errors/AppError";

export type ValidationIssue = {
  path: string;
  message: string;
};

export class ValidationError extends AppError {
  readonly details: ValidationIssue[];

  constructor(error: ZodError) {
    super("Validation failed", 400);
    this.name = "ValidationError";
    this.details = error.issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
    }));
  }
}
