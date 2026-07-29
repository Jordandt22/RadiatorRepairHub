"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function cleanAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", window.location.pathname);
}

async function hydrateSessionFromRedirect() {
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

export default function EmailConfirmedContent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    hydrateSessionFromRedirect().finally(() => {
      if (mounted) setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700"
        aria-hidden="true"
      >
        <Check className="size-8 stroke-[2.5]" />
      </div>

      <h1 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
        Email Confirmed
      </h1>

      <p className="mt-3 text-base text-gray-600">
        Thanks, we received your confirmation.
      </p>

      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        For an email address update to finish, make sure you confirm from{" "}
        <span className="font-medium text-gray-800">both</span> your old and new
        email inboxes. If you still have a confirmation link waiting, open it to
        complete the change.
      </p>

      <Link
        href="/settings"
        className={`mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 ${
          ready ? "" : "pointer-events-none opacity-70"
        }`}
        aria-disabled={!ready}
      >
        Go to Settings
      </Link>
    </div>
  );
}
