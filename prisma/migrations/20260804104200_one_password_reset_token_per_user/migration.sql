-- Keep at most one reset token per user (latest), then enforce uniqueness
DELETE FROM "PasswordResetToken" a
USING "PasswordResetToken" b
WHERE a."user_id" = b."user_id"
  AND a."created_at" < b."created_at";

-- Drop unused column from previous design
ALTER TABLE "PasswordResetToken" DROP COLUMN IF EXISTS "used_at";

-- Replace non-unique index with unique constraint on user_id
DROP INDEX IF EXISTS "PasswordResetToken_user_id_idx";
CREATE UNIQUE INDEX "PasswordResetToken_user_id_key" ON "PasswordResetToken"("user_id");
