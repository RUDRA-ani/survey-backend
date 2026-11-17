
export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  totalAnswers: number;
  responsePercentage: number;

  optionCounts?: Record<string, number>;
  optionPercentages?: Record<string, number>;

  averageRating?: number;
  textAnswers?: string[];
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  totalRatings: number;
  totalTextResponses: number;
  overallAverageRating: number;
  questions: QuestionAnalytics[];
}
