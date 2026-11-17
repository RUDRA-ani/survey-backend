
import { Router } from "express";

import {
  createSurveyController,
  getAllSurveysController,
  getSurveyByIdController,
  updateSurveyController,
  deleteSurveyController,
  publishSurveyController,
} from "../controllers/survey.controller";

import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();

// All survey management routes require admin authentication.
router.use(authenticateAdmin);

router.post("/", createSurveyController);
router.get("/", getAllSurveysController);
router.get("/:id", getSurveyByIdController);
router.put("/:id", updateSurveyController);
router.delete("/:id", deleteSurveyController);
router.patch("/:id/publish", publishSurveyController);

export default router;
