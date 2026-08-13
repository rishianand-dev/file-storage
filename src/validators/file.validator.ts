import { z } from "zod";

/** Multipart forms often send "" when an optional field is left blank. */
function emptyStringToNull(value: unknown) {
  if (value === "" || value === undefined) return null;
  return value;
}

export const uploadFileBodySchema = z.object({
  folder_id: z.preprocess(
    emptyStringToNull,
    z.uuid("Invalid folder id").nullable(),
  ),
});

export type UploadFileBody = z.infer<typeof uploadFileBodySchema>;

export const trashFileBodySchema = z.object({
  id: z.uuid("Invalid file id"),
});

export const restoreFileBodySchema = z.object({
  id: z.uuid("Invalid file id"),
});

export const permanentDeleteFileBodySchema = z.object({
  id: z.uuid("Invalid file id"),
});

export const moveFileBodySchema = z.object({
  id: z.uuid("Invalid file id"),
  folder_id: z.preprocess(
    emptyStringToNull,
    z.uuid("Invalid folder id").nullable(),
  ),
});

export const renameFileBodySchema = z.object({
  file_id: z.uuid("Invalid file id"),
  name: z.string().min(1, "Name is required"),
});

export const fileIdParamsSchema = z.object({
  id: z.uuid("Invalid file id"),
});

export type TrashFileBody = z.infer<typeof trashFileBodySchema>;
export type RestoreFileBody = z.infer<typeof restoreFileBodySchema>;
export type PermanentDeleteFileBody = z.infer<
  typeof permanentDeleteFileBodySchema
>;
export type MoveFileBody = z.infer<typeof moveFileBodySchema>;
export type RenameFileBody = z.infer<typeof renameFileBodySchema>;
export type FileIdParams = z.infer<typeof fileIdParamsSchema>;
