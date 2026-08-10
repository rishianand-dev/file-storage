import { z } from "zod";

export const trackRecentlyOpenedBodySchema = z.object({
  file_id: z.uuid("Invalid file id"),
});

export const listRecentlyOpenedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type TrackRecentlyOpenedBody = z.infer<
  typeof trackRecentlyOpenedBodySchema
>;
export type ListRecentlyOpenedQuery = z.infer<
  typeof listRecentlyOpenedQuerySchema
>;
