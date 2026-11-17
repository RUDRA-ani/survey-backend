
import { Router } from "express";

import {
  getPublicSurvey,
  submitPublicResponse,
} from "../controllers/public-survey.controller";

const router = Router();

// No authentication middleware here.
// Anyone can access published surveys and submit responses.

router.get("/surveys/:id", getPublicSurvey);
router.post("/surveys/:id/responses", submitPublicResponse);

export default router;
