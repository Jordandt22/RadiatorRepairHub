import Redis from "ioredis";
export const redisClient = new Redis({
  host: process.env.REDIS_URL,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

export const cacheData = async (key, timeInterval, data) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Set Data to Cache [${key}]`);

  await redisClient.set(key, JSON.stringify({ data }), "EX", timeInterval);
};

export const getCacheData = async (key) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Retrieved Data from Cache [${key}]`);
  return JSON.parse(await redisClient.get(key));
};

export const deleteCacheData = async (key) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Deleted Data from Cache [${key}]`);
  await redisClient.del(key);
};

export const deleteCacheDataByPrefix = async (prefix) => {
  if (process.env.NODE_ENV === "development")
    console.log(`REDIS: Deleted All Data from Cache with [${prefix}]`);

  await redisClient.keys(prefix + "*").then(function (keys) {
    var pipeline = redisClient.pipeline();
    keys.forEach(function (key) {
      pipeline.del(key);
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

export const getBusinessesByStateKey = (state_id, page, limit) => ({
  key: `STATE_BUSINESSES?STATE-ID:${state_id}&PAGE:${page}&LIMIT:${limit}`,
  interval: 60 * 60 * 24 * 7,
});

export const getCountBusinessesByStateKey = (state_id) => ({
  key: `STATE_BUSINESSES_COUNT?STATE-ID:${state_id}`,
  interval: 60 * 60 * 24 * 7,
});

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
