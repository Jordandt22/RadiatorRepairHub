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
  getCountBusinessesByCityKey,
  getBusinessesByCityKey,
  getCityBySlugKey,
} from "../redis/redis.js";
import {
  getTopRatedBusinesses,
  getBusinessById,
  getBusinessesByState,
  countBusinessesByState,
  countBusinessesByCity,
  getBusinessesByCity,
  getCityBySlug,
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

export const getCityBusinesses = async (req, res) => {
  const { city_slug, state_id } = req.params;
  const { page, limit } = req.query;
  let formattedPage = Number(page);
  const formattedLimit = Number(limit);
  let count = 0;
  let city_id = null;

  // Get Cached City Data
  const { key: cityKey, interval: cityInterval } = getCityBySlugKey(
    city_slug,
    state_id
  );
  const cachedCityData = await getCacheData(cityKey);
  if (cachedCityData) {
    city_id = cachedCityData.data.id;
  } else {
    // Get City ID
    const { data: cityData, error: cityError } = await getCityBySlug(
      city_slug,
      state_id
    );
    if (cityError) {
      if (cityError.code === "PGRST116") {
        return res.status(404).json(customErrorHandler(SUPABASE_ERROR, `City by slug (${city_slug}) in state (${state_id}) not found.`, cityError));
      }

      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            `There was an error fetching city by slug (${city_slug}) in state (${state_id}).`,
            cityError
          )
        );
    }

    city_id = cityData.id;
    await cacheData(cityKey, cityInterval, cityData);
  }

  // Get Cached Count of Businesses by City Data
  const { key: countKey, interval: countInterval } =
    getCountBusinessesByCityKey(city_id, state_id);
  const cachedCountData = await getCacheData(countKey);
  if (cachedCountData) {
    count = cachedCountData.data;
  } else {
    // Get Count of Businesses by City
    const { count: countData, error: countError } = await countBusinessesByCity(
      city_id,
      state_id
    );
    if (countError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            `There was an error fetching count of businesses by city (${city_id}).`,
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

  // Get Cached Businesses by City Data
  const { key, interval } = getBusinessesByCityKey(
    city_id,
    state_id,
    formattedPage,
    formattedLimit
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Businesses by City
  const { data, error } = await getBusinessesByCity(
    city_id,
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
          `There was an error fetching businesses by city (${city_id}).`,
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

  // Cache Data
  await cacheData(key, interval, compiledData);
  res.status(200).json(successHandler(compiledData));
};
