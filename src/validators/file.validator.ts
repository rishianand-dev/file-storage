import { z } from "zod";

export const uploadFileBodySchema = z.object({
  folder_id: z.uuid("Invalid folder id").nullable().optional(),
});

export type UploadFileBody = z.infer<typeof uploadFileBodySchema>;
