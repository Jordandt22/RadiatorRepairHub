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
  interval: 60 * 60 * 3,
});

// --- Location ----
export const getStatesKey = () => ({
  key: `STATES`,
  interval: 60 * 60 * 24,
});

export const getCitiesKey = (state_id) => ({
  key: `STATE_STATE-ID:${state_id}_CITIES`,
  interval: 60 * 60 * 24,
});

export const getPostalCodesKey = (city_id) => ({
  key: `CITY_CITY-ID:${city_id}_POSTAL_CODES`,
  interval: 60 * 60 * 24,
});

// --- Categories ----
export const getPrimaryCategoriesKey = () => ({
  key: `PRIMARY_CATEGORIES`,
  interval: 60 * 60 * 24,
});

export const getSecondaryCategoriesKey = () => ({
  key: `SECONDARY_CATEGORIES`,
  interval: 60 * 60 * 24,
});
