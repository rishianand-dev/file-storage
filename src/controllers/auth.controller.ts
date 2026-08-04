import type { Request, Response } from "express";
import * as authService from "@/services/auth.service";
import type {
  ForgotPasswordBody,
  LoginBody,
  RefreshBody,
  RegisterBody,
  ResetPasswordBody,
} from "@/validators";

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body as RegisterBody);
  res.status(201).json({ status: "success", data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as LoginBody);
  res.status(200).json({ status: "success", data: result });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshBody;
  const result = await authService.refresh(refreshToken);
  res.status(200).json({ status: "success", data: result });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshBody;
  await authService.logout(refreshToken);
  res.status(200).json({ status: "success", data: null });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const result = await authService.forgotPassword(req.body as ForgotPasswordBody);
  res.status(200).json({ status: "success", data: result });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await authService.resetPassword(req.body as ResetPasswordBody);
  res.status(200).json({
    status: "success",
    data: { message: "Password has been reset. You can sign in now." },
  });
}
