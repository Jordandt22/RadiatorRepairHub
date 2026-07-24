import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchApi } from "./fetchApi";

async function getAccessToken() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/** Browser-only authenticated fetch (Bearer access token from Supabase session). */
export async function fetchAuthenticatedApi(path, options = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      data: null,
      error: { message: "Not signed in." },
      status: 401,
    };
  }

  const { headers, ...rest } = options;
  return fetchApi(path, {
    ...rest,
    cache: rest.cache ?? "no-store",
    headers: {
      ...(headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
