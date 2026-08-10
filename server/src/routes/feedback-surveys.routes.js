import { Router } from "express";
import { createFeedbackSurvey } from "../controllers/feedback-surveys.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateFeedbackSurveySchema } from "../schemas/feedback-surveys.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const feedbackSurveysRouter = Router();

feedbackSurveysRouter.post(
  "/",
  bodyValidator(CreateFeedbackSurveySchema),
  serverErrorCatcherWrapper(createFeedbackSurvey)
);

export default feedbackSurveysRouter;
