import Redis from "ioredis";
export const redisClient = new Redis({
  host: process.env.REDIS_URL,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Check Key for Development
export const checkKey = (key) =>
  process.env.NODE_ENV === "development" ? "DEV_" + key : key;

// Check Interval for Development
export const checkInterval = (interval) =>
  process.env.NODE_ENV === "development" ? 60 * 30 : interval;

export const createSearchBusinessKey = (mainKey, searchParamValues) => {
  let udpatedKey = mainKey;

  // Add Search Parameters to Key
  searchParamValues.forEach(({ key, value }) => {
    udpatedKey += `&${key.toUpperCase().replace("_", "-")}:${value}`;
  });

  return udpatedKey;
};

// Cache Actions
export const cacheData = async (key, timeInterval, data) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Set Data to Cache [${key}]`);

  await redisClient.set(
    checkKey(key),
    JSON.stringify({ data }),
    "EX",
    checkInterval(timeInterval)
  );
};

export const getCacheData = async (key) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Retrieved Data from Cache [${key}]`);
  return JSON.parse(await redisClient.get(checkKey(key)));
};

export const deleteCacheData = async (key) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Deleted Data from Cache [${key}]`);
  await redisClient.del(checkKey(key));
};

export const deleteCacheDataByPrefix = async (prefix) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Deleted All Data from Cache with [${prefix}]`);

  await redisClient.keys(checkKey(prefix) + "*").then(function (keys) {
    var pipeline = redisClient.pipeline();
    keys.forEach(function (key) {
      pipeline.del(checkKey(key));
    });
    return pipeline.exec();
  });
};

export const flushDBCache = async () => {
  if (process.env.NODE_ENV === "development")
    console.log("REDIS: Flushing Cache");

  await redisClient.flushdb();
};

// REDIS KEYS

// --- Businesses ----
export const getFeaturedBusinessesKey = () => ({
  key: `FEATURED_BUSINESSES`,
  interval: 60 * 60 * 24 * 2,
});

export const getBusinessByIdKey = (business_id) => ({
  key: `BUSINESS?BUSINESS-ID:${business_id}`,
  interval: 60 * 60 * 24 * 7,
});

export const getBusinessBySlugKey = (business_slug) => ({
  key: `BUSINESS?BUSINESS-SLUG:${business_slug}`,
  interval: 60 * 60 * 24 * 7,
});

// State Businesses
export const getBusinessesByStateKey = (state_id, page, limit) => ({
  key: `STATE_BUSINESSES?STATE-ID:${state_id}&PAGE:${page}&LIMIT:${limit}`,
  interval: 60 * 60 * 24 * 7,
});

export const getCountBusinessesByStateKey = (state_id) => ({
  key: `STATE_BUSINESSES_COUNT?STATE-ID:${state_id}`,
  interval: 60 * 60 * 24 * 7,
});

// City Businesses
export const getCityBySlugKey = (city_slug, state_id) => ({
  key: `CITY?CITY-SLUG:${city_slug}&STATE-ID:${state_id}`,
  interval: 60 * 60 * 24 * 7,
});

export const getBusinessesByCityKey = (city_id, state_id, page, limit) => ({
  key: `CITY_BUSINESSES?CITY-ID:${city_id}&STATE-ID:${state_id}&PAGE:${page}&LIMIT:${limit}`,
  interval: 60 * 60 * 24 * 7,
});

export const getCountBusinessesByCityKey = (city_id, state_id) => ({
  key: `CITY_BUSINESSES_COUNT?CITY-ID:${city_id}&STATE-ID:${state_id}`,
  interval: 60 * 60 * 24 * 7,
});

// Search Businesses
export const getCountBusinessesBySearchKey = (
  searchParamValues,
  sort_option
) => ({
  key: createSearchBusinessKey(
    `SEARCHED_BUSINESSES_COUNT?SORT-OPTION:${sort_option}`,
    searchParamValues
  ),
  interval: 60 * 30,
});

export const getSearchedBusinessesKey = (
  searchParamValues,
  page,
  limit,
  sort_option
) => ({
  key: createSearchBusinessKey(
    `SEARCHED_BUSINESSES?PAGE:${page}&LIMIT:${limit}&SORT-OPTION:${sort_option}`,
    searchParamValues
  ),
  interval: 60 * 30,
});

// --- Location ----
export const getStatesKey = () => ({
  key: `STATES`,
  interval: 60 * 60 * 24 * 7,
});

export const getCitiesKey = (state_id) => ({
  key: `STATE?STATE-ID:${state_id}&CITIES`,
  interval: 60 * 60 * 24 * 7,
});

export const getPostalCodesKey = (city_id) => ({
  key: `CITY?CITY-ID:${city_id}&POSTAL_CODES`,
  interval: 60 * 60 * 24 * 7,
});

// --- Categories ----
export const getPrimaryCategoriesKey = () => ({
  key: `PRIMARY_CATEGORIES`,
  interval: 60 * 60 * 24 * 7,
});

export const getSecondaryCategoriesKey = () => ({
  key: `SECONDARY_CATEGORIES`,
  interval: 60 * 60 * 24 * 7,
});
