import { z } from "zod";

export const updateMeBodySchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100).optional(),
    email: z.email("Invalid email address").optional(),
    image: z
      .union([z.string().trim().url("Invalid image URL"), z.null()])
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.email !== undefined ||
      data.image !== undefined,
    { message: "At least one field is required- (name, email, image) " },
  );

export type UpdateMeBody = z.infer<typeof updateMeBodySchema>;
