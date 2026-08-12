-- Folder: user_id -> owner_id and indexes
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_user_id_fkey";
DROP INDEX "Folder_user_id_parent_id_idx";
DROP INDEX "Folder_user_id_deleted_at_idx";
ALTER TABLE "Folder" RENAME COLUMN "user_id" TO "owner_id";
CREATE INDEX "Folder_owner_id_idx" ON "Folder"("owner_id");
CREATE INDEX "Folder_parent_id_idx" ON "Folder"("parent_id");
CREATE INDEX "Folder_deleted_at_idx" ON "Folder"("deleted_at");
CREATE UNIQUE INDEX "Folder_owner_id_parent_id_name_key" ON "Folder"("owner_id", "parent_id", "name");
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- File: align columns with schema
ALTER TABLE "File" DROP CONSTRAINT "File_user_id_fkey";
DROP INDEX "File_storage_key_key";
DROP INDEX "File_user_id_deleted_at_idx";
DROP INDEX "File_user_id_folder_id_idx";
ALTER TABLE "File" RENAME COLUMN "user_id" TO "owner_id";
ALTER TABLE "File" RENAME COLUMN "size_bytes" TO "size";
ALTER TABLE "File" RENAME COLUMN "storage_key" TO "storage_name";
ALTER TABLE "File" DROP COLUMN "checksum";
ALTER TABLE "File" ADD COLUMN "extension" TEXT NOT NULL;
ALTER TABLE "File" ADD COLUMN "storage_path" TEXT NOT NULL;
CREATE UNIQUE INDEX "File_storage_name_key" ON "File"("storage_name");
CREATE INDEX "File_owner_id_idx" ON "File"("owner_id");
CREATE INDEX "File_folder_id_idx" ON "File"("folder_id");
CREATE INDEX "File_deleted_at_idx" ON "File"("deleted_at");
CREATE UNIQUE INDEX "File_owner_id_folder_id_name_key" ON "File"("owner_id", "folder_id", "name");
ALTER TABLE "File" ADD CONSTRAINT "File_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
