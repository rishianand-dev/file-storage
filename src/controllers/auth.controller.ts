import type { Request, Response } from "express";
import * as authService from "@/services/auth.service";
import type { LoginBody, RegisterBody } from "@/validators";

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body as RegisterBody);
  res.status(201).json({ status: "success", data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as LoginBody);
  res.status(200).json({ status: "success", data: result });
}
