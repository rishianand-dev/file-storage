import { z } from "zod";

export const folderIdParamsSchema = z.object({
  id: z.uuid("Invalid folder id"),
});

export const createFolderBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  parent_id: z.uuid("Invalid parent folder id").nullable().optional(),
});

export const renameFolderBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

export const moveFolderBodySchema = z.object({
  parent_id: z.uuid("Invalid parent folder id").nullable(),
});

export type FolderIdParams = z.infer<typeof folderIdParamsSchema>;
export type CreateFolderBody = z.infer<typeof createFolderBodySchema>;
export type RenameFolderBody = z.infer<typeof renameFolderBodySchema>;
export type MoveFolderBody = z.infer<typeof moveFolderBodySchema>;
