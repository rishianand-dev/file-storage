import { env } from "@/config/env";

/**
 * Sends a password-reset email.
 * Dev: logs the link. Later: plug in SMTP/Resend/etc.
 */
export async function sendPasswordResetEmail(
  email: string,
  rawToken: string,
): Promise<void> {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  if (env.nodeEnv === "production") {
    // TODO: integrate a real email provider
    console.info(`[mail] password reset for ${email}: ${resetUrl}`);
    return;
  }

  console.info(`[mail:dev] Password reset for ${email}`);
  console.info(`[mail:dev] ${resetUrl}`);
  console.info(`[mail:dev] token=${rawToken}`);
}
