import { z } from "zod";

export const createFileBodySchema = z.object({
  folder_id: z.uuid("Invalid folder id").nullable().optional(),
});

export type CreateFileBody = z.infer<typeof createFileBodySchema>;
