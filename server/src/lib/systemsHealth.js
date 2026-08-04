import { redisClient } from "../redis/redis.js";
import { supabase } from "../supabase/supabase.js";
import { getWebBaseUrl } from "./constants/messages.js";

const CHECK_TIMEOUT_MS = 3000;

const withTimeout = async (promise, label) => {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} check timed out`));
        }, CHECK_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const runCheck = async (id, label, fn) => {
  const startedAt = Date.now();
  try {
    const detail = await withTimeout(fn(), label);
    return {
      id,
      label,
      status: "ok",
      latency_ms: Date.now() - startedAt,
      ...(detail && typeof detail === "object" ? { detail } : {}),
    };
  } catch (error) {
    return {
      id,
      label,
      status: "error",
      latency_ms: Date.now() - startedAt,
      message: error?.message || `${label} check failed`,
    };
  }
};

const checkRedis = () =>
  runCheck("redis", "Redis", async () => {
    const pong = await redisClient.ping();
    if (pong !== "PONG") {
      throw new Error(`Unexpected Redis ping response: ${pong}`);
    }
    return null;
  });

const checkDatabase = () =>
  runCheck("database", "Supabase", async () => {
    const { error } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      throw new Error(error.message || "Supabase query failed");
    }
    return null;
  });

const checkWebsite = () =>
  runCheck("website", "RadiatorRepairHub", async () => {
    const baseUrl = getWebBaseUrl();
    // Prefer robots.txt: lightweight and less likely to trip Cloudflare bot checks.
    const url = `${baseUrl}/robots.txt`;
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: {
        Accept: "text/plain,text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        // Browser-like UA — bare custom agents are often blocked by Cloudflare.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Website returned HTTP ${response.status}`);
    }

    return { url: baseUrl };
  });

export const getSystemsHealthChecks = async () => {
  const checks = await Promise.all([
    checkRedis(),
    checkDatabase(),
    checkWebsite(),
  ]);

  const hasError = checks.some((check) => check.status === "error");

  return {
    status: hasError ? "error" : "ok",
    checked_at: new Date().toISOString(),
    checks,
  };
};
