
import { z } from "zod";

const conditionSchema = z.object({
  questionId: z.string().min(1),
  operator: z.enum(["equals", "not_equals"]),
  value: z.string(),
});

const questionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Question title is required"),
  type: z.enum([
    "text",
    "multiple_choice",
    "checkbox",
    "rating",
  ]),
  required: z.boolean(),
  options: z.array(z.string().trim()).default([]),
  condition: conditionSchema.optional(),
});

export const createSurveySchema = z.object({
  title: z.string().trim().min(1, "Survey title is required"),
  description: z.string().default(""),
  questions: z.array(questionSchema).default([]),
});

export const updateSurveySchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  questions: z.array(questionSchema).optional(),
});
