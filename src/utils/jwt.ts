import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    email: typeof decoded.email === "string" ? decoded.email : "",
  };
}
