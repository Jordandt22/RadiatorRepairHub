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
  getCityBySlugKey,
  getPostalCodesByStateKey,
} from "../redis/redis.js";
import {
  getAllStates,
  getAllCities,
  getAllCitiesList,
  getAllPostalCodes,
  getPostalCodesByState,
  getCityBySlug,
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
