import { createClient } from "@supabase/supabase-js";

const isDev = process.env.NODE_ENV === "development";

const supabaseUrl = isDev
  ? process.env.DEV_SUPABASE_URL
  : process.env.SUPABASE_URL;

const supabaseServiceRoleKey = isDev
  ? process.env.DEV_SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  const envPrefix = isDev ? "DEV_" : "";
  throw new Error(
    `Missing ${envPrefix}SUPABASE_URL or ${envPrefix}SUPABASE_SERVICE_ROLE_KEY`,
  );
}

console.log(`Supabase: using ${isDev ? "DEV" : "PROD"} (${supabaseUrl})`);

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const adminAuthClient = supabase.auth.admin;
