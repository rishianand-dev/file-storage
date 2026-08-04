import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export type AuthTokenPayload = AccessTokenPayload;

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const signAuthToken = signAccessToken;

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    email: typeof decoded.email === "string" ? decoded.email : "",
  };
}

export const verifyAuthToken = verifyAccessToken;

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiresAt(): Date {
  const match = /^(\d+)([smhd])$/.exec(env.jwtRefreshExpiresIn);
  if (!match) {
    throw new Error(`Invalid JWT_REFRESH_EXPIRES_IN: ${env.jwtRefreshExpiresIn}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const ms =
    {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    }[unit] * amount;

  return new Date(Date.now() + ms);
}
