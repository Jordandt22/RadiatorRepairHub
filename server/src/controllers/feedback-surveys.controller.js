import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { insertFeedbackSurvey } from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";

const { SUPABASE_ERROR } = errorCodes;

export const createFeedbackSurvey = async (req, res) => {
  const { formType, businessId, foundVia, foundLookingFor, comment } = req.body;

  const payload = {
    form_type: formType,
    business_id: businessId || null,
    found_via: foundVia,
    found_looking_for: foundLookingFor,
    comment: comment?.trim() || null,
  };

  const { data, error } = await insertFeedbackSurvey(payload);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving your feedback.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("FEEDBACK_SURVEYS");

  return res.status(201).json(
    successHandler({
      feedbackSurveyId: data.feedback_survey_id,
      message: "Thanks for your feedback!",
    })
  );
};
