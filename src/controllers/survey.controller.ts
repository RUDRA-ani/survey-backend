
import type { Request, Response } from "express";

import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
} from "../services/survey.service";

import {
  createSurveySchema,
  updateSurveySchema,
} from "../validators/survey.validator";

function getSurveyId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// Create survey
export async function createSurveyController(
  req: Request,
  res: Response
) {
  try {
    const validation = createSurveySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid survey data",
        errors: validation.error.flatten(),
      });
    }

    const survey = await createSurvey(validation.data);

    return res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: survey,
    });
  } catch (error) {
    console.error("Create survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create survey",
    });
  }
}

// Get all surveys
export async function getAllSurveysController(
  req: Request,
  res: Response
) {
  try {
    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

    const result = await getAllSurveys(
      page,
      limit,
      search
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch surveys",
    });
  }
}

// Get survey by ID
export async function getSurveyByIdController(
  req: Request,
  res: Response
) {
  try {
    const survey = await getSurveyById(getSurveyId(req));

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error("Get survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve survey",
    });
  }
}

// Update survey
export async function updateSurveyController(
  req: Request,
  res: Response
) {
  try {
    const validation = updateSurveySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid survey data",
        errors: validation.error.flatten(),
      });
    }

    const survey = await updateSurvey(
      getSurveyId(req),
      validation.data
    );

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: survey,
    });
  } catch (error) {
    console.error("Update survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update survey",
    });
  }
}

// Delete survey
export async function deleteSurveyController(
  req: Request,
  res: Response
) {
  try {
    const deleted = await deleteSurvey(getSurveyId(req));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Survey deleted successfully",
    });
  } catch (error) {
    console.error("Delete survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete survey",
    });
  }
}

// Publish survey
// Publish survey
export async function publishSurveyController(
  req: Request,
  res: Response
) {
  try {
    const id = getSurveyId(req);

    const existingSurvey = await getSurveyById(id);

    if (!existingSurvey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    if (existingSurvey.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A survey must contain at least one question before publishing",
      });
    }

    if (existingSurvey.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Survey is already published",
      });
    }

    const survey = await publishSurvey(id);

    return res.status(200).json({
      success: true,
      message: "Survey published successfully",
      data: survey,
    });
  } catch (error) {
    console.error("Publish survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish survey",
    });
  }
}