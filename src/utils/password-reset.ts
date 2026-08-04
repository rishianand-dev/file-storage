import { createHash, randomBytes } from "node:crypto";
import { env } from "@/config/env";

function parseDurationToMs(value: string, envName: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid ${envName}: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";

  return (
    {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    }[unit] * amount
  );
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function passwordResetExpiresAt(): Date {
  const ms = parseDurationToMs(
    env.passwordResetExpiresIn,
    "PASSWORD_RESET_EXPIRES_IN",
  );
  return new Date(Date.now() + ms);
}
