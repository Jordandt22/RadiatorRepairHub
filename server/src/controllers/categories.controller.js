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
  getPrimaryCategoryBySlugKey,
} from "../redis/redis.js";
import {
  getAllPrimaryCategories,
  getAllSecondaryCategories,
  getPrimaryCategoryBySlug,
} from "../supabase/supabase.functions.js";

const { SUPABASE_ERROR } = errorCodes;

export const getPrimaryCategories = async (req, res) => {
  const { key, interval } = getPrimaryCategoriesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

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

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getPrimaryCategoryBySlugHandler = async (req, res) => {
  const slug = req.params.slug.toLowerCase();

  const { key, interval } = getPrimaryCategoryBySlugKey(slug);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getPrimaryCategoryBySlug(slug);
  if (error) {
    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            `Primary category "${slug}" not found.`,
            error
          )
        );
    }

    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching primary category "${slug}".`,
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getSecondaryCategories = async (req, res) => {
  const { key, interval } = getSecondaryCategoriesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

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

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};
