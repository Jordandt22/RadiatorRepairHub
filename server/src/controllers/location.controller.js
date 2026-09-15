import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  cacheData,
  getStatesKey,
  getCacheData,
  getCitiesKey,
  getPostalCodesKey,
  getAllCitiesKey,
  getCitiesCountKey,
  getCitiesForSitemapKey,
  getCityCategoriesForSitemapKey,
  getStateCategoriesForSitemapKey,
  getCityCategoryCountsKey,
  getStateCategoryCountsKey,
  getCategoryCityCountsKey,
  getCategoryStateCountsKey,
  getCityBySlugKey,
  getPostalCodesByStateKey,
  getStateBusinessCountsKey,
  getCityBusinessCountsKey,
} from "../redis/redis.js";
import {
  getAllStates,
  getAllCities,
  getAllCitiesList,
  getCitiesCount,
  getAllPostalCodes,
  getPostalCodesByState,
  getCityBySlug,
  getStateBusinessCounts,
  getCityBusinessCounts,
  getCitiesWithBusinessesForSitemap,
  getCityCategoryPairsForSitemap,
  getStateCategoryPairsForSitemap,
  getCategoryCountsForCity,
  getCategoryCountsForState,
  getCityCountsForCategory,
  getStateCountsForCategory,
} from "../supabase/supabase.functions.js";

const { SUPABASE_ERROR } = errorCodes;

export const getStates = async (req, res) => {
  const { key, interval } = getStatesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getAllStates();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching states.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getStateBusinessCountsHandler = async (req, res) => {
  const codesParam =
    typeof req.query.codes === "string" ? req.query.codes.trim() : "";
  const codes = codesParam
    ? codesParam
        .split(",")
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean)
    : undefined;

  const parsedLimit = Number.parseInt(String(req.query.limit ?? ""), 10);
  const limit =
    !codes && Number.isFinite(parsedLimit)
      ? Math.min(50, Math.max(1, parsedLimit))
      : codes
        ? undefined
        : 6;

  const codesKey = codes?.length ? codes.join(",") : "";
  const { key, interval } = getStateBusinessCountsKey({
    codesKey,
    limit: codes?.length ? null : limit,
  });
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getStateBusinessCounts({ codes, limit });
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching state business counts.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCityBusinessCountsHandler = async (req, res) => {
  const { state_id } = req.params;
  const { key, interval } = getCityBusinessCountsKey(state_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCityBusinessCounts(state_id);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching city business counts.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getAllCitiesHandler = async (req, res) => {
  const { key, interval } = getAllCitiesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getAllCitiesList();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching cities.",
          error
        )
      );
  }

  if (data.length > 0) await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCitiesCountHandler = async (req, res) => {
  const { key, interval } = getCitiesCountKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { count, error } = await getCitiesCount();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching cities count.",
          error
        )
      );
  }

  const payload = { count };
  await cacheData(key, interval, payload);
  res.status(200).json(successHandler(payload));
};

export const getCitiesForSitemapHandler = async (req, res) => {
  const { key, interval } = getCitiesForSitemapKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCitiesWithBusinessesForSitemap();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching cities for sitemap.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCityCategoriesForSitemapHandler = async (req, res) => {
  const { key, interval } = getCityCategoriesForSitemapKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCityCategoryPairsForSitemap();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching city-category pairs for sitemap.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getStateCategoriesForSitemapHandler = async (req, res) => {
  const { key, interval } = getStateCategoriesForSitemapKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getStateCategoryPairsForSitemap();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching state-category pairs for sitemap.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCityCategoryCountsHandler = async (req, res) => {
  const { city_id } = req.params;
  const { key, interval } = getCityCategoryCountsKey(city_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCategoryCountsForCity(city_id);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching category counts for this city.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getStateCategoryCountsHandler = async (req, res) => {
  const { state_id } = req.params;
  const { key, interval } = getStateCategoryCountsKey(state_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCategoryCountsForState(state_id);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching category counts for this state.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCategoryCityCountsHandler = async (req, res) => {
  const { category_id } = req.params;
  const parsedLimit = Number.parseInt(String(req.query.limit ?? ""), 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(50, Math.max(1, parsedLimit))
    : 12;
  const stateId =
    typeof req.query.state_id === "string" && req.query.state_id.trim()
      ? req.query.state_id.trim()
      : null;

  const { key, interval } = getCategoryCityCountsKey(
    category_id,
    limit,
    stateId
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCityCountsForCategory(
    category_id,
    limit,
    stateId
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching city counts for this category.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCategoryStateCountsHandler = async (req, res) => {
  const { category_id } = req.params;
  const parsedLimit = Number.parseInt(String(req.query.limit ?? ""), 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(50, Math.max(1, parsedLimit))
    : 12;

  const { key, interval } = getCategoryStateCountsKey(category_id, limit);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getStateCountsForCategory(category_id, limit);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching state counts for this category.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCities = async (req, res) => {
  const { state_id } = req.params;

  const { key, interval } = getCitiesKey(state_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getAllCities(state_id);
  if (error) {
    if (error.code === "22P02") {
      return res
        .status(422)
        .json(customErrorHandler(SUPABASE_ERROR, "Invalid State ID!", error));
    }

    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching cities for ${state_id}.`,
          error
        )
      );
  }

  if (data.length > 0) await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCityBySlugHandler = async (req, res) => {
  const { state_id, city_slug } = req.params;

  const { key, interval } = getCityBySlugKey(state_id, city_slug);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getCityBySlug(city_slug, state_id);
  if (error) {
    if (error.code === "22P02") {
      return res
        .status(422)
        .json(customErrorHandler(SUPABASE_ERROR, "Invalid State ID!", error));
    }

    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            `City "${city_slug}" not found in state.`,
            error
          )
        );
    }

    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching city "${city_slug}".`,
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getPostalCodes = async (req, res) => {
  const { city_id } = req.params;

  const { key, interval } = getPostalCodesKey(city_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getAllPostalCodes(city_id);
  if (error) {
    if (error.code === "22P02") {
      return res
        .status(422)
        .json(customErrorHandler(SUPABASE_ERROR, "Invalid City ID!", error));
    }

    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching postal codes for ${city_id}.`,
          error
        )
      );
  }

  if (data.length > 0) await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getPostalCodesByStateHandler = async (req, res) => {
  const { state_id } = req.params;

  const { key, interval } = getPostalCodesByStateKey(state_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getPostalCodesByState(state_id);
  if (error) {
    if (error.code === "22P02") {
      return res
        .status(422)
        .json(customErrorHandler(SUPABASE_ERROR, "Invalid State ID!", error));
    }

    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching postal codes for state ${state_id}.`,
          error
        )
      );
  }

  if (data.length > 0) await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};
