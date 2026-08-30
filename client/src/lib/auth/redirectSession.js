import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function cleanAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", window.location.pathname);
}

export function getAuthRedirectError() {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash?.replace(/^#/, "") ?? "";
  const search = window.location.search?.replace(/^\?/, "") ?? "";
  const params = new URLSearchParams(hash || search);
  const error = params.get("error");
  const errorCode = params.get("error_code");
  if (!error && !errorCode) return null;

  return {
    error,
    errorCode,
    description: params.get("error_description"),
  };
}

export async function hydrateSessionFromRedirect() {
  try {
    const supabase = getSupabaseBrowserClient();

    const hash = window.location.hash?.replace(/^#/, "") ?? "";
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        cleanAuthParamsFromUrl();
        await supabase.auth.getUser();
        return;
      }
    }

    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      cleanAuthParamsFromUrl();
      await supabase.auth.getUser();
    }
  } catch {
    // Confirmation may already be applied server-side; page can still show success.
  }
}
