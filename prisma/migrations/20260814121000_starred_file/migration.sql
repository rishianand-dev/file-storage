-- CreateTable
CREATE TABLE "StarredFile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "starred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarredFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StarredFile_user_id_starred_at_idx" ON "StarredFile"("user_id", "starred_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "StarredFile_user_id_file_id_key" ON "StarredFile"("user_id", "file_id");

-- AddForeignKey
ALTER TABLE "StarredFile" ADD CONSTRAINT "StarredFile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarredFile" ADD CONSTRAINT "StarredFile_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
