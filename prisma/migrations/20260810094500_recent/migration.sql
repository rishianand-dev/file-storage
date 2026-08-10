-- CreateTable
CREATE TABLE "Recent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" TEXT,
    "folder_id" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Recent_file_or_folder_check" CHECK (
        ("file_id" IS NOT NULL AND "folder_id" IS NULL)
        OR ("file_id" IS NULL AND "folder_id" IS NOT NULL)
    )
);

-- CreateIndex
CREATE INDEX "Recent_user_id_accessed_at_idx" ON "Recent"("user_id", "accessed_at" DESC);

-- CreateIndex
CREATE INDEX "Recent_file_id_idx" ON "Recent"("file_id");

-- CreateIndex
CREATE INDEX "Recent_folder_id_idx" ON "Recent"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recent_user_id_file_id_key" ON "Recent"("user_id", "file_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recent_user_id_folder_id_key" ON "Recent"("user_id", "folder_id");

-- AddForeignKey
ALTER TABLE "Recent" ADD CONSTRAINT "Recent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recent" ADD CONSTRAINT "Recent_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recent" ADD CONSTRAINT "Recent_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
