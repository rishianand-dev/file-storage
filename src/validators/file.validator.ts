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

export const renameFileBodySchema = z.object({
  file_id: z.uuid("Invalid file id"),
  name: z.string().min(1, "Name is required"),
});

export type RenameFileBody = z.infer<typeof renameFileBodySchema>;
