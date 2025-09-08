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
} from "../redis/redis.js";
import {
  getAllStates,
  getAllCities,
  getAllPostalCodes,
} from "../supabase/supabase.functions.js";

const { SUPABASE_ERROR } = errorCodes;

export const getStates = async (req, res) => {
  // Get Data from Cache
  const { key, interval } = getStatesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get States
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

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getCities = async (req, res) => {
  const { state_id } = req.params;

  // Get Data from Cache
  const { key, interval } = getCitiesKey(state_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Cities
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

  // Cache Data
  if (data.length > 0) await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getPostalCodes = async (req, res) => {
  const { city_id } = req.params;

  // Get Data from Cache
  const { key, interval } = getPostalCodesKey(city_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Postal Codes
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

  // Cache Data
  if (data.length > 0) await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};
