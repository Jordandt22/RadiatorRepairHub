import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  cacheData,
  getFeaturedBusinessesKey,
  getCacheData,
} from "../redis/redis.js";
import { getTopRatedBusinesses } from "../supabase/supabase.functions.js";

const { SUPABASE_ERROR } = errorCodes;

export const getFeaturedBusinesses = async (req, res) => {
  // Get Data from Cache
  const { key, interval } = getFeaturedBusinessesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Top 10 Rated Businesses
  const { data, error } = await getTopRatedBusinesses();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching featured businesses.",
          error
        )
      );
  }

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};
