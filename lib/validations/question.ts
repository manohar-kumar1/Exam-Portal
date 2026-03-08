import { z } from "zod";

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, "Option text is required"),
});

export const createQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(["mcq", "true_false", "fill_blank"]),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  marks: z.number().min(0).default(1),
  explanation: z.string().optional(),
  imageUrl: z.string().url().optional(),
  orderIndex: z.number().int().min(0),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string().uuid()),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
