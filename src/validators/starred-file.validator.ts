import { z } from "zod";

export const starFileBodySchema = z.object({
  file_id: z.uuid("Invalid file id"),
});

export const starredFileParamsSchema = z.object({
  fileId: z.uuid("Invalid file id"),
});

export const listStarredFilesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type StarFileBody = z.infer<typeof starFileBodySchema>;
export type StarredFileParams = z.infer<typeof starredFileParamsSchema>;
export type ListStarredFilesQuery = z.infer<typeof listStarredFilesQuerySchema>;
