-- CreateTable
CREATE TABLE "StarredFolder" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "starred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarredFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StarredFolder_user_id_starred_at_idx" ON "StarredFolder"("user_id", "starred_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "StarredFolder_user_id_folder_id_key" ON "StarredFolder"("user_id", "folder_id");

-- AddForeignKey
ALTER TABLE "StarredFolder" ADD CONSTRAINT "StarredFolder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarredFolder" ADD CONSTRAINT "StarredFolder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
