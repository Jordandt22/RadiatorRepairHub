import { logger } from "./logger.js";
import { allowedOriginsForDomain } from "./partnerSiteDomain.js";
import { supabase } from "../supabase/supabase.js";

const CACHE_MS = 60_000;
const ERROR_RETRY_MS = 10_000;

function fixedOrigins() {
  const extra = (process.env.TEMPLATE_SITE_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    process.env.WEB_URL,
    process.env.INTERNAL_CLIENT_URL,
    ...extra,
  ];
  return new Set(origins.filter(Boolean));
}

export function isFixedBrowserOrigin(origin) {
  if (!origin) return false;
  return fixedOrigins().has(origin);
}

let cache = {
  expiresAt: 0,
  origins: new Set(),
};

export function clearPartnerSiteOriginCache() {
  cache = { expiresAt: 0, origins: new Set() };
}

async function loadPartnerOrigins() {
  const now = Date.now();
  if (now < cache.expiresAt) return cache.origins;

  try {
    const { data, error } = await supabase
      .from("partner_sites")
      .select("domain, businesses!inner(is_partner, is_claimed)")
      .not("domain", "is", null);

    if (error) throw error;

    const origins = new Set();
    for (const row of data ?? []) {
      const business = row.businesses;
      if (!business?.is_partner || !business?.is_claimed) continue;
      for (const origin of allowedOriginsForDomain(row.domain)) {
        origins.add(origin);
      }
    }
    cache = { expiresAt: now + CACHE_MS, origins };
    return origins;
  } catch (error) {
    logger.warn({ err: error }, "Partner site CORS list unavailable");
    cache = {
      expiresAt: now + ERROR_RETRY_MS,
      origins: cache.origins,
    };
    return cache.origins;
  }
}

export async function isPartnerSiteOriginAllowed(origin) {
  if (!origin) return false;
  const origins = await loadPartnerOrigins();
  return origins.has(origin);
}
