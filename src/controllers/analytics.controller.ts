
import type { Request, Response } from "express";

import { getSurveyAnalytics } from "../services/analytics.service";

export async function getSurveyAnalyticsController(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;
    const surveyId = Array.isArray(id) ? id[0] : id;

    const analytics = await getSurveyAnalytics(surveyId);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get survey analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve survey analytics",
    });
  }
}
