const isDev = process.env.NODE_ENV === "development";

const redisHost = isDev ? process.env.DEV_REDIS_URL : process.env.REDIS_URL;
const redisPort = Number(
  isDev ? process.env.DEV_REDIS_PORT : process.env.REDIS_PORT
);
const redisPassword = isDev
  ? process.env.DEV_REDIS_PASSWORD
  : process.env.REDIS_PASSWORD;

/** BullMQ connection options (BullMQ creates its own ioredis clients). */
export function getBullmqConnectionOptions() {
  return {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null,
  };
}
