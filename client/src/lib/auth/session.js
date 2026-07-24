import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function persistSession(session) {
  if (!session?.access_token || !session?.refresh_token) {
    return { error: { message: "Missing session tokens." } };
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
