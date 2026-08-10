-- DropTable
DROP TABLE IF EXISTS "Recent";

-- CreateTable
CREATE TABLE "RecentlyOpened" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyOpened_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentlyOpened_user_id_opened_at_idx" ON "RecentlyOpened"("user_id", "opened_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyOpened_user_id_file_id_key" ON "RecentlyOpened"("user_id", "file_id");

-- AddForeignKey
ALTER TABLE "RecentlyOpened" ADD CONSTRAINT "RecentlyOpened_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyOpened" ADD CONSTRAINT "RecentlyOpened_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
