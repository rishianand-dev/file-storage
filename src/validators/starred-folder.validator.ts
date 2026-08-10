import { z } from "zod";

export const starFolderBodySchema = z.object({
  folder_id: z.uuid("Invalid folder id"),
});

export const starredFolderParamsSchema = z.object({
  folderId: z.uuid("Invalid folder id"),
});

export const listStarredFoldersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type StarFolderBody = z.infer<typeof starFolderBodySchema>;
export type StarredFolderParams = z.infer<typeof starredFolderParamsSchema>;
export type ListStarredFoldersQuery = z.infer<
  typeof listStarredFoldersQuerySchema
>;
