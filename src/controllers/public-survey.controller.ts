
import type { Request, Response } from "express";

import { getSurveyById } from "../services/survey.service";
import { submitResponse } from "../services/response.service";
import { submitResponseSchema } from "../validators/response.validator";

function getSurveyId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// Get a published survey for public viewing
export async function getPublicSurvey(
  req: Request,
  res: Response
) {
  try {
    const survey = await getSurveyById(getSurveyId(req));

    if (!survey || survey.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Survey not found or not published",
      });
    }

    return res.status(200).json({
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error("Get public survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve survey",
    });
  }
}

// Submit answers without admin authentication
export async function submitPublicResponse(
  req: Request,
  res: Response
) {
  try {
    const surveyId = getSurveyId(req);
    const survey = await getSurveyById(surveyId);

    if (!survey || survey.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Survey not found or not published",
      });
    }

    const validation = submitResponseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid response data",
        errors: validation.error.flatten(),
      });
    }

    const answers = validation.data.answers;

    // Reject answers for unknown questions.
    const questionIds = new Set(
      survey.questions.map((question) => question.id)
    );

    if (answers.some((answer) => !questionIds.has(answer.questionId))) {
      return res.status(400).json({
        success: false,
        message: "Response contains an unknown question",
      });
    }

    // Reject duplicate answers for the same question.
    const submittedQuestionIds = new Set<string>();

    for (const answer of answers) {
      if (submittedQuestionIds.has(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate answer for question: ${answer.questionId}`,
        });
      }

      submittedQuestionIds.add(answer.questionId);
    }

    const answerMap = new Map(
      answers.map((answer) => [answer.questionId, answer])
    );

    // Track questions that are actually visible.
    const visibleQuestionIds = new Set<string>();

    for (const question of survey.questions) {
      let isVisible = true;

      // Evaluate conditional visibility.
      if (question.condition) {
        const sourceId = question.condition.questionId;
        const sourceAnswer = answerMap.get(sourceId);

        // A condition cannot be evaluated if its source
        // question was hidden or left unanswered.
        if (
          !visibleQuestionIds.has(sourceId) ||
          !sourceAnswer ||
          typeof sourceAnswer.value !== "string"
        ) {
          isVisible = false;
        } else {
          const matches =
            sourceAnswer.value === question.condition.value;

          isVisible =
            question.condition.operator === "equals"
              ? matches
              : !matches;
        }
      }

      const answer = answerMap.get(question.id);

      // Reject answers to questions that should be hidden.
      if (!isVisible) {
        if (answer) {
          return res.status(400).json({
            success: false,
            message: `Question should not be answered: ${question.title}`,
          });
        }

        continue;
      }

      visibleQuestionIds.add(question.id);

      // Required questions must have meaningful answers.
      const isEmptyAnswer =
        !answer ||
        (typeof answer.value === "string" &&
          answer.value.trim() === "") ||
        (Array.isArray(answer.value) &&
          answer.value.length === 0);

      if (question.required && isEmptyAnswer) {
        return res.status(400).json({
          success: false,
          message: `Answer required for: ${question.title}`,
        });
      }

      if (!answer) continue;

      // Validate answer types.
      if (
        question.type === "text" &&
        typeof answer.value !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid answer for: ${question.title}`,
        });
      }

      if (
        question.type === "multiple_choice" &&
        (typeof answer.value !== "string" ||
          !question.options.includes(answer.value))
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid option for: ${question.title}`,
        });
      }

      if (
        question.type === "checkbox" &&
        (!Array.isArray(answer.value) ||
          answer.value.some(
            (value) => !question.options.includes(value)
          ) ||
          new Set(answer.value).size !== answer.value.length)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid options for: ${question.title}`,
        });
      }

      if (
        question.type === "rating" &&
        (typeof answer.value !== "number" ||
          !Number.isInteger(answer.value) ||
          answer.value < 1 ||
          answer.value > 5)
      ) {
        return res.status(400).json({
          success: false,
          message: `Rating must be between 1 and 5 for: ${question.title}`,
        });
      }
    }

    const response = await submitResponse(surveyId, answers);

    return res.status(201).json({
      success: true,
      message: "Response submitted successfully",
      data: response,
    });
  } catch (error) {
    console.error("Submit public response error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit response",
    });
  }
}
