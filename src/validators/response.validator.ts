
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
  ]),
});

export const submitResponseSchema = z.object({
  answers: z.array(answerSchema).min(1, "At least one answer is required"),
});
