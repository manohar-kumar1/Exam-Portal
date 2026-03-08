import { z } from "zod";

export const createSectionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  orderIndex: z.number().int().min(0),
});

export const updateSectionSchema = createSectionSchema.partial();

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string().uuid()),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
