import { createClient } from "@supabase/supabase-js";

const isDev = process.env.NODE_ENV === "development";

const supabaseUrl = isDev
  ? process.env.DEV_SUPABASE_URL
  : process.env.SUPABASE_URL;

const supabaseServiceRoleKey = isDev
  ? process.env.DEV_SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAnonKey = isDev
  ? process.env.DEV_SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  const envPrefix = isDev ? "DEV_" : "";
  throw new Error(
    `Missing ${envPrefix}SUPABASE_URL or ${envPrefix}SUPABASE_SERVICE_ROLE_KEY`,
  );
}

if (!supabaseAnonKey) {
  const envPrefix = isDev ? "DEV_" : "";
  throw new Error(`Missing ${envPrefix}SUPABASE_ANON_KEY`);
}

console.log(`Supabase: using ${isDev ? "DEV" : "PROD"} (${supabaseUrl})`);

const authClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

/** Service-role client — bypasses RLS. Use for public reads, admin, and claim RPCs. */
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  authClientOptions,
);

/** Shared anon client (no user JWT). Used for auth.getUser(accessToken), etc. */
export const supabaseAnon = createClient(
  supabaseUrl,
  supabaseAnonKey,
  authClientOptions,
);

export const adminAuthClient = supabase.auth.admin;

/**
 * Anon-key client scoped to a user's access token so RLS policies apply.
 * Create per-request; do not reuse across users.
 */
export function createUserSupabaseClient(accessToken) {
  if (!accessToken) {
    throw new Error("Missing access token for user Supabase client.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    ...authClientOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
