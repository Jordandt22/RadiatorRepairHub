import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export function getSupabaseTarget() {
  if (process.env.RRH_TARGET === "prod") return "prod";
  if (process.env.RRH_TARGET === "dev") return "dev";
  if (process.env.NODE_ENV === "development") return "dev";
  if (process.env.NODE_ENV === "production") return "prod";
  return "dev";
}

export function getSupabaseConfig() {
  const target = getSupabaseTarget();

  if (target === "dev") {
    return {
      target,
      url: process.env.DEV_SUPABASE_URL,
      key: process.env.DEV_SUPABASE_KEY,
    };
  }

  return {
    target,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  };
}

export function createSupabaseClient() {
  const { target, url, key } = getSupabaseConfig();

  if (!url || !key) {
    throw new Error(
      `Missing Supabase credentials for "${target}". Check your .env file.`
    );
  }

  return createClient(url, key);
}

export function logSupabaseTarget() {
  const target = getSupabaseTarget();
  console.log(`Using ${target === "dev" ? "DEV" : "PRODUCTION"} Supabase`);
}
