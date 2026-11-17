
export type QuestionType =
  | "text"
  | "multiple_choice"
  | "checkbox"
  | "rating";

export type SurveyStatus = "draft" | "published";

export interface SurveyCondition {
  questionId: string;
  operator: "equals" | "not_equals";
  value: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  type: QuestionType;
  required: boolean;
  options: string[];
  condition?: SurveyCondition;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurveyInput {
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface UpdateSurveyInput {
  title?: string;
  description?: string;
  questions?: SurveyQuestion[];
}
