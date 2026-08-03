import { Provider } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { prisma } from "@/prisma";
import { hashPassword, signAuthToken, verifyPassword } from "@/utils";
import type { LoginBody, RegisterBody } from "@/validators";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type AuthResult = {
  user: AuthUser;
  token: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

function toAuthResult(user: AuthUser): AuthResult {
  return {
    user,
    token: signAuthToken({ sub: user.id, email: user.email }),
  };
}

/**
 * Credentials register: creates User + CREDENTIALS Account.
 * OAuth providers will create User + GOOGLE/GITHUB Account separately.
 */
export async function register(input: RegisterBody): Promise<AuthResult> {
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      hashed_password: true,
      accounts: { select: { provider_name: true } },
    },
  });

  if (existing) {
    const providers = existing.accounts.map((a) => a.provider_name);
    if (providers.includes(Provider.CREDENTIALS) || existing.hashed_password) {
      throw new AppError("Email is already registered", 409);
    }
    throw new AppError(
      "An account with this email already exists via social login. Sign in with Google or GitHub.",
      409,
    );
  }

  const hashed_password = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      hashed_password,
      accounts: {
        create: {
          provider_name: Provider.CREDENTIALS,
          provider_id: email,
        },
      },
    },
    select: userSelect,
  });

  return toAuthResult(user);
}

/**
 * Credentials login. OAuth users without a password are directed to social login.
 */
export async function login(input: LoginBody): Promise<AuthResult> {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...userSelect,
      hashed_password: true,
      accounts: { select: { provider_name: true } },
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.hashed_password) {
    const social = user.accounts
      .map((a) => a.provider_name)
      .filter((p) => p !== Provider.CREDENTIALS);

    throw new AppError(
      social.length > 0
        ? `This account uses social login. Sign in with ${social.join(" or ")}.`
        : "Invalid email or password",
      401,
    );
  }

  const valid = await verifyPassword(input.password, user.hashed_password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  return toAuthResult({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  });
}
