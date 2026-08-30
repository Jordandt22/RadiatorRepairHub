import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import {
  getCityStateId,
  incrementSearchStatRpc,
} from "../supabase/supabase.functions.js";
import { businessStatDateKey } from "../lib/businessStatsDate.js";

const { SUPABASE_ERROR, SERVER_ERROR } = errorCodes;

export const createSearchStatEvent = async (req, res) => {
  const { state_id, city_id, category_id, zero_results } = req.body;
  const statDate = businessStatDateKey();

  let resolvedStateId = state_id || null;
  if (city_id && !resolvedStateId) {
    const { data: city, error: cityError } = await getCityStateId(city_id);
    if (cityError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error resolving the city.",
            cityError
          )
        );
    }
    resolvedStateId = city?.state_id || null;
  }

  const increments = [];
  if (city_id) {
    increments.push({ dimension: "city", dimensionId: city_id });
  }
  if (resolvedStateId) {
    increments.push({ dimension: "state", dimensionId: resolvedStateId });
  }
  if (category_id) {
    increments.push({ dimension: "category", dimensionId: category_id });
  }

  if (increments.length === 0) {
    return res.status(204).end();
  }

  for (const item of increments) {
    const { error } = await incrementSearchStatRpc({
      dimension: item.dimension,
      dimensionId: item.dimensionId,
      statDate,
      zeroResults: Boolean(zero_results),
    });

    if (error) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SERVER_ERROR,
            "There was an error recording the search event.",
            error
          )
        );
    }
  }

  return res.status(204).end();
};
