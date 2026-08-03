import type { NextFunction, Request, Response } from "express";
import { type ZodType, ZodError } from "zod";
import { ValidationError } from "@/errors/ValidationError";

type RequestSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/**
 * Validates req.body / req.query / req.params with Zod before the controller runs.
 * On success, replaces those fields with the parsed (typed + transformed) values.
 */
export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(error));
        return;
      }
      next(error);
    }
  };
}
