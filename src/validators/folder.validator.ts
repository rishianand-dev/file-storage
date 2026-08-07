import { z } from "zod";

export const createFolderBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  parent_id: z.uuid("Invalid parent folder id").nullable().optional(),
});

export type CreateFolderBody = z.infer<typeof createFolderBodySchema>;
