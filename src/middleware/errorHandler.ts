import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { ValidationError } from "@/errors/ValidationError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({
    status: "error",
    message,
  });
}
