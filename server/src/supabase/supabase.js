import { createClient } from "@supabase/supabase-js";

const isDev = process.env.NODE_ENV === "development";

const supabaseUrl = isDev
  ? process.env.DEV_SUPABASE_URL
  : process.env.SUPABASE_URL;

const supabaseServiceRoleKey = isDev
  ? process.env.DEV_SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

if (process.env.NODE_ENV !== "production") {
  console.log(
    `Supabase: using ${isDev ? "DEV" : "PROD"} (${supabaseUrl})`
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const adminAuthClient = supabase.auth.admin;
