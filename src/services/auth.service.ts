import { Provider } from "@generated/prisma/client";
import { AppError } from "@/errors";
import { prisma } from "@/prisma";
import {
  generatePasswordResetToken,
  generateRefreshToken,
  hashPassword,
  hashPasswordResetToken,
  hashRefreshToken,
  passwordResetExpiresAt,
  refreshTokenExpiresAt,
  sendPasswordResetEmail,
  signAccessToken,
  verifyPassword,
} from "@/utils";
import type {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from "@/validators";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: AuthUser;
} & TokenPair;

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

async function issueTokenPair(user: AuthUser): Promise<TokenPair> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token_hash: hashRefreshToken(refreshToken),
      user_id: user.id,
      expires_at: refreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken };
}

async function toAuthResult(user: AuthUser): Promise<AuthResult> {
  const tokens = await issueTokenPair(user);
  return { user, ...tokens };
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

/**
 * Rotates the refresh token and issues a new access token.
 * Reuse of a revoked token revokes all sessions for that user.
 */
export async function refresh(rawRefreshToken: string): Promise<TokenPair> {
  const tokenHash = hashRefreshToken(rawRefreshToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { token_hash: tokenHash },
    select: {
      id: true,
      user_id: true,
      expires_at: true,
      revoked_at: true,
      user: { select: userSelect },
    },
  });

  if (!stored) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (stored.revoked_at) {
    // revoke all other tokens for the user
    await prisma.refreshToken.updateMany({
      where: { user_id: stored.user_id, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    throw new AppError("Refresh token reuse detected. Please sign in again.", 401);
  }

  if (stored.expires_at.getTime() <= Date.now()) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked_at: new Date() },
    });
    throw new AppError("Refresh token expired", 401);
  }

  const newRefreshToken = generateRefreshToken();
  const accessToken = signAccessToken({
    sub: stored.user.id,
    email: stored.user.email,
  });

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked_at: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        token_hash: hashRefreshToken(newRefreshToken),
        user_id: stored.user_id,
        expires_at: refreshTokenExpiresAt(),
      },
    }),
  ]);

  return { accessToken, refreshToken: newRefreshToken };
}
// WHY $transaction?
// Without a transaction:

// update old (success)
// create new (fails / crash)
// → user has no valid refresh token
// or worse timing issues under load.

// With $transaction:

// Both succeed → old revoked + new created
// Anything fails → both roll back → DB stays as before
// All-or-nothing.



/**
 * Revokes a refresh token (logout from this session).
 */
export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawRefreshToken);

  await prisma.refreshToken.updateMany({
    where: { token_hash: tokenHash, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

const FORGOT_PASSWORD_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

/**
 * Creates a password-reset token and emails a link.
 * Always returns the same message to avoid email enumeration.
 * Keeps at most one token per user: deletes any existing token first.
 */
export async function forgotPassword(
  input: ForgotPasswordBody,
): Promise<{ message: string }> {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, hashed_password: true },
  });

  // Only credentials users can reset a password
  if (user?.hashed_password) {
    const rawToken = generatePasswordResetToken();

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { user_id: user.id },
      }),
      prisma.passwordResetToken.create({
        data: {
          token_hash: hashPasswordResetToken(rawToken),
          user_id: user.id,
          expires_at: passwordResetExpiresAt(),
        },
      }),
    ]);

    await sendPasswordResetEmail(email, rawToken);
  }

  return { message: FORGOT_PASSWORD_MESSAGE };
}

/**
 * Sets a new password using a valid reset token and revokes all sessions.
 * Deletes the reset token so old email links stop working.
 */
export async function resetPassword(input: ResetPasswordBody): Promise<void> {
  const tokenHash = hashPasswordResetToken(input.token);

  const stored = await prisma.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
    select: {
      id: true,
      user_id: true,
      expires_at: true,
    },
  });

  if (!stored || stored.expires_at.getTime() <= Date.now()) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const hashed_password = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: stored.user_id },
      data: { hashed_password },
    }),
    prisma.refreshToken.updateMany({
      where: { user_id: stored.user_id, revoked_at: null },
      data: { revoked_at: new Date() },
    }),
    prisma.passwordResetToken.delete({
      where: { id: stored.id },
    }),
  ]);
}
