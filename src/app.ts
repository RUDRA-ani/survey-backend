
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import surveyRoutes from "./routes/survey.routes";
import publicSurveyRoutes from "./routes/public-survey.routes";
import analyticsRoutes from "./routes/analytics.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Survey Platform API is running!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/public", publicSurveyRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
