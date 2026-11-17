
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import type {
  Survey,
  CreateSurveyInput,
  UpdateSurveyInput,
} from "../types/survey.types";

const DATA_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "surveys.json"
);

async function readSurveys(): Promise<Survey[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as Survey[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeSurveys([]);
      return [];
    }

    throw error;
  }
}

async function writeSurveys(surveys: Survey[]): Promise<void> {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(surveys, null, 2),
    "utf-8"
  );
}

export async function createSurvey(
  input: CreateSurveyInput
): Promise<Survey> {
  const surveys = await readSurveys();

  const now = new Date().toISOString();

  const survey: Survey = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || "",
    status: "draft",
    questions: input.questions,
    createdAt: now,
    updatedAt: now,
  };

  surveys.push(survey);
  await writeSurveys(surveys);

  return survey;
}

export async function getAllSurveys(
  page = 1,
  limit = 10,
  search = ""
) {
  const surveys = await readSurveys();

  // Search by title or description
  const query = search.trim().toLowerCase();

  const filteredSurveys = query
    ? surveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(query) ||
          survey.description.toLowerCase().includes(query)
      )
    : surveys;

  const totalSurveys = filteredSurveys.length;
  const totalPages = Math.ceil(totalSurveys / limit);
  const startIndex = (page - 1) * limit;

  const paginatedSurveys = filteredSurveys.slice(
    startIndex,
    startIndex + limit
  );

  return {
    surveys: paginatedSurveys,
    pagination: {
      currentPage: page,
      totalPages,
      totalSurveys,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
export async function getSurveyById(
  id: string
): Promise<Survey | null> {
  const surveys = await readSurveys();

  return surveys.find((survey) => survey.id === id) || null;
}

export async function updateSurvey(
  id: string,
  input: UpdateSurveyInput
): Promise<Survey | null> {
  const surveys = await readSurveys();

  const index = surveys.findIndex(
    (survey) => survey.id === id
  );

  if (index === -1) return null;

  const existingSurvey = surveys[index];

  const updatedSurvey: Survey = {
    ...existingSurvey,
    ...input,
    title: input.title?.trim() ?? existingSurvey.title,
    description:
      input.description?.trim() ?? existingSurvey.description,
    updatedAt: new Date().toISOString(),
  };

  surveys[index] = updatedSurvey;

  await writeSurveys(surveys);

  return updatedSurvey;
}

export async function deleteSurvey(id: string): Promise<boolean> {
  const surveys = await readSurveys();

  const filteredSurveys = surveys.filter(
    (survey) => survey.id !== id
  );

  if (filteredSurveys.length === surveys.length) {
    return false;
  }

  await writeSurveys(filteredSurveys);

  return true;
}

export async function publishSurvey(
  id: string
): Promise<Survey | null> {
  const surveys = await readSurveys();

  const survey = surveys.find(
    (item) => item.id === id
  );

  if (!survey) return null;

  survey.status = "published";
  survey.updatedAt = new Date().toISOString();

  await writeSurveys(surveys);

  return survey;
}
