
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import type {
  SurveyAnswer,
  SurveyResponse,
} from "../types/response.types";

const DATA_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "responses.json"
);

async function readResponses(): Promise<SurveyResponse[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as SurveyResponse[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeResponses([]);
      return [];
    }

    throw error;
  }
}

async function writeResponses(
  responses: SurveyResponse[]
): Promise<void> {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(responses, null, 2),
    "utf-8"
  );
}

export async function submitResponse(
  surveyId: string,
  answers: SurveyAnswer[]
): Promise<SurveyResponse> {
  const responses = await readResponses();

  const response: SurveyResponse = {
    id: randomUUID(),
    surveyId,
    answers,
    submittedAt: new Date().toISOString(),
  };

  responses.push(response);
  await writeResponses(responses);

  return response;
}

export async function getResponsesBySurveyId(
  surveyId: string
): Promise<SurveyResponse[]> {
  const responses = await readResponses();

  return responses.filter(
    (response) => response.surveyId === surveyId
  );
}
