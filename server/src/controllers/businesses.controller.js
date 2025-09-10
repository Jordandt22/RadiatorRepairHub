import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  cacheData,
  getFeaturedBusinessesKey,
  getCacheData,
  getBusinessByIdKey,
  getBusinessesByStateKey,
  getCountBusinessesByStateKey,
} from "../redis/redis.js";
import {
  getTopRatedBusinesses,
  getBusinessById,
  getBusinessesByState,
  countBusinessesByState,
} from "../supabase/supabase.functions.js";

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

export const getBusiness = async (req, res) => {
  const { business_id } = req.params;

  // Get Cache Data
  const { key, interval } = getBusinessByIdKey(business_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Business by ID
  const { data, error } = await getBusinessById(business_id);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching business by ID (${business_id}).`,
          error
        )
      );
  }

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getStateBusinesses = async (req, res) => {
  const { state_id } = req.params;
  const { page, limit } = req.query;
  let formattedPage = Number(page);
  const formattedLimit = Number(limit);
  let count = 0;

  // Get Cached Count of Businesses by State Data
  const { key: countKey, interval: countInterval } =
    getCountBusinessesByStateKey(state_id);
  const cachedCountData = await getCacheData(countKey);
  if (cachedCountData) {
    count = cachedCountData.data;
  } else {
    // Get Count of Businesses by State
    const { count: countData, error: countError } =
      await countBusinessesByState(state_id);
    if (countError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            `There was an error fetching count of businesses by state (${state_id}).`,
            countError
          )
        );
    }

    count = countData;
    await cacheData(countKey, countInterval, count);
  }

  // Check Page
  const totalPages = Math.ceil(count / formattedLimit);
  if (formattedPage > totalPages) {
    formattedPage = totalPages;
  }

  // Get Cached Businesses by State Data
  const { key, interval } = getBusinessesByStateKey(
    state_id,
    formattedPage,
    formattedLimit
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Businesses by State
  const { data, error } = await getBusinessesByState(
    state_id,
    formattedPage,
    formattedLimit
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching businesses by state (${state_id}).`,
          error
        )
      );
  }

  if (data.length === 0) {
    return res.status(200).json(
      successHandler({
        businesses: [],
        requestTotal: 0,
        totalBusinesses: 0,
        totalPages: 0,
        page: formattedPage,
        limit: formattedLimit,
      })
    );
  }

  // Cache Data
  const compiledData = {
    businesses: data,
    requestTotal: data.length,
    totalBusinesses: count,
    totalPages,
    page: formattedPage,
    limit: formattedLimit,
  };
  await cacheData(key, interval, compiledData);
  res.status(200).json(successHandler(compiledData));
};
