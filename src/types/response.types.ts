export interface SurveyAnswer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: SurveyAnswer[];
  submittedAt: string;
}