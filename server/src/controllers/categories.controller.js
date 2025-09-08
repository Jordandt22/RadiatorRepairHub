import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  cacheData,
  getCacheData,
  getPrimaryCategoriesKey,
  getSecondaryCategoriesKey,
} from "../redis/redis.js";
import { getAllPrimaryCategories, getAllSecondaryCategories } from "../supabase/supabase.functions.js";

const { SUPABASE_ERROR } = errorCodes;

export const getPrimaryCategories = async (req, res) => {
  // Get Data from Cache
  const { key, interval } = getPrimaryCategoriesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Primary Categories
  const { data, error } = await getAllPrimaryCategories();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching primary categories.",
          error
        )
      );
  }

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getSecondaryCategories = async (req, res) => {
  // Get Data from Cache
  const { key, interval } = getSecondaryCategoriesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Secondary Categories
  const { data, error } = await getAllSecondaryCategories();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching secondary categories.",
          error
        )
      );
  }

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};
