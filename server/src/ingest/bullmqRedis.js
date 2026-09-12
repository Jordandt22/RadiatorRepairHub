const isDev = process.env.NODE_ENV === "development";

const redisHost = isDev ? process.env.DEV_REDIS_URL : process.env.REDIS_URL;
const redisPort = Number(
  isDev ? process.env.DEV_REDIS_PORT : process.env.REDIS_PORT
);
const redisPassword = isDev
  ? process.env.DEV_REDIS_PASSWORD
  : process.env.REDIS_PASSWORD;

/** Logical Redis DB — used in development when RRH and Diesel share one instance. */
function getRedisDb() {
  if (!isDev) return undefined;
  const raw = process.env.DEV_REDIS_DB;
  if (raw === undefined || String(raw).trim() === "") return 0;
  const db = Number(raw);
  return Number.isInteger(db) && db >= 0 ? db : 0;
}

/** BullMQ connection options (BullMQ creates its own ioredis clients). */
export function getBullmqConnectionOptions() {
  const db = getRedisDb();
  return {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null,
    ...(db === undefined ? {} : { db }),
  };
}
