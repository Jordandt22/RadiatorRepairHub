import Redis from "ioredis";
import dotenv from "dotenv";
import { getSupabaseTarget } from "./supabaseClient.js";

dotenv.config();

const REFERENCE_CACHE_PREFIXES = [
  "ALL_CITIES",
  "STATE?STATE-ID:",
  "CITY?CITY-ID:",
  "CITY?CITY-SLUG:",
  "PRIMARY_CATEGORIES",
  "SECONDARY_CATEGORIES",
  "PRIMARY_CATEGORY?SLUG:",
  "BUSINESS_SITEMAP_SLUGS",
];

function getRedisConfig() {
  const target = getSupabaseTarget();
  const isDev = target === "dev";

  return {
    target,
    host: isDev ? process.env.DEV_REDIS_URL : process.env.REDIS_URL,
    port: Number(isDev ? process.env.DEV_REDIS_PORT : process.env.REDIS_PORT),
    password: isDev ? process.env.DEV_REDIS_PASSWORD : process.env.REDIS_PASSWORD,
    keyPrefix: isDev ? "DEV_" : "",
  };
}

function checkKey(key, keyPrefix) {
  return keyPrefix ? `${keyPrefix}${key}` : key;
}

export async function clearReferenceCache() {
  const { target, host, port, password, keyPrefix } = getRedisConfig();

  if (!host || !port) {
    console.warn("⚠️ Redis not configured — skipping reference cache clear");
    return false;
  }

  const redis = new Redis({ host, port, password });

  try {
    let deleted = 0;

    for (const prefix of REFERENCE_CACHE_PREFIXES) {
      const keys = await redis.keys(`${checkKey(prefix, keyPrefix)}*`);
      if (keys.length === 0) continue;

      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
      deleted += keys.length;
    }

    console.log(
      `✅ Cleared ${deleted} reference cache key(s) from ${target.toUpperCase()} Redis`
    );
    return true;
  } finally {
    redis.disconnect();
  }
}

if (process.argv[1]?.includes("clearReferenceCache")) {
  clearReferenceCache()
    .catch((err) => {
      console.error("❌ Failed to clear reference cache:", err.message);
      process.exit(1);
    })
    .then((ok) => {
      if (ok === false) process.exit(0);
    });
}
