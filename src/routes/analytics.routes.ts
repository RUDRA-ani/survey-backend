
import { Router } from "express";

import { getSurveyAnalyticsController } from "../controllers/analytics.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateAdmin);

router.get("/surveys/:id", getSurveyAnalyticsController);

export default router;
