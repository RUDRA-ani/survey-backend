
import { getSurveyById } from "./survey.service";
import { getResponsesBySurveyId } from "./response.service";

import type {
  SurveyAnalytics,
  QuestionAnalytics,
} from "../types/analytics.types";

export async function getSurveyAnalytics(
  surveyId: string
): Promise<SurveyAnalytics | null> {
  const survey = await getSurveyById(surveyId);

  if (!survey) return null;

  const responses = await getResponsesBySurveyId(surveyId);

  let totalRatings = 0;
  let totalRatingValue = 0;
  let totalTextResponses = 0;

  const questions: QuestionAnalytics[] = survey.questions.map(
    (question) => {
      const answers = responses
        .map((response) =>
          response.answers.find(
            (answer) => answer.questionId === question.id
          )
        )
        .filter((answer) => answer !== undefined);

      const result: QuestionAnalytics = {
        questionId: question.id,
        questionTitle: question.title,
        questionType: question.type,
        totalAnswers: answers.length,
        responsePercentage:
          responses.length > 0
            ? Number(
                ((answers.length / responses.length) * 100).toFixed(2)
              )
            : 0,
      };

      if (
        question.type === "multiple_choice" ||
        question.type === "checkbox"
      ) {
        const counts: Record<string, number> = {};

        question.options.forEach((option) => {
          counts[option] = 0;
        });

        answers.forEach((answer) => {
          if (question.type === "multiple_choice") {
            if (
              typeof answer.value === "string" &&
              answer.value in counts
            ) {
              counts[answer.value]++;
            }
          }

          if (question.type === "checkbox") {
            if (Array.isArray(answer.value)) {
              answer.value.forEach((option) => {
                if (option in counts) {
                  counts[option]++;
                }
              });
            }
          }
        });

        const percentages: Record<string, number> = {};

        Object.entries(counts).forEach(([option, count]) => {
          percentages[option] =
            answers.length > 0
              ? Number(
                  ((count / answers.length) * 100).toFixed(2)
                )
              : 0;
        });

        result.optionCounts = counts;
        result.optionPercentages = percentages;
      }

      if (question.type === "rating") {
        const ratings = answers
          .map((answer) => answer.value)
          .filter(
            (value): value is number =>
              typeof value === "number"
          );

        totalRatings += ratings.length;

        totalRatingValue += ratings.reduce(
          (sum, rating) => sum + rating,
          0
        );

        result.averageRating =
          ratings.length > 0
            ? Number(
                (
                  ratings.reduce((sum, rating) => sum + rating, 0) /
                  ratings.length
                ).toFixed(2)
              )
            : 0;
      }

      if (question.type === "text") {
        result.textAnswers = answers
          .map((answer) => answer.value)
          .filter(
            (value): value is string =>
              typeof value === "string"
          );

        totalTextResponses += result.textAnswers.length;
      }

      return result;
    }
  );

  return {
    surveyId,
    totalResponses: responses.length,
    totalRatings,
    totalTextResponses,
    overallAverageRating:
      totalRatings > 0
        ? Number((totalRatingValue / totalRatings).toFixed(2))
        : 0,
    questions,
  };
}
