import { trackGtagBusinessStat } from "@/lib/analytics/gtag";
import { fetchApi } from "@/lib/api/fetchApi";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

async function getAccessToken() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function trackBusinessStat({
  businessId,
  event,
  source,
  position,
} = {}) {
  if (!businessId || !event) return;

  trackGtagBusinessStat({ businessId, event, source, position });

  try {
    const accessToken = await getAccessToken();
    const headers = { "Content-Type": "application/json" };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const body = { businessId, event };
    if (source) body.source = source;
    if (typeof position === "number") body.position = position;

    await fetchApi("/business-stats/events", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    // best-effort
  }
}
