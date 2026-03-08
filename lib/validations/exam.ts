import { z } from "zod";

export const createExamSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(1).max(480).default(45),
  passingPercentage: z.number().min(0).max(100).default(40),
  shuffleQuestions: z.boolean().default(false),
  allowNegativeMarking: z.boolean().default(false),
  negativeMarkValue: z.number().min(0).max(100).default(0),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
