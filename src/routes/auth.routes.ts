
import { Router } from "express";

import {
  loginAdmin,
  getCurrentAdmin,
  forgotPassword,
  resetAdminPassword,
} from "../controllers/auth.controller";

import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", loginAdmin);

router.get("/me", authenticateAdmin, getCurrentAdmin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetAdminPassword);

export default router;
