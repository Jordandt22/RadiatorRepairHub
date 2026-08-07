"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { signOut } from "@/lib/auth/session";

export default function ProtectedAuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function redirectToSignIn() {
      await signOut();
      if (!mounted) return;
      const returnTo = pathname
        ? `?redirect=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/signin${returnTo}`);
    }

    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        // Verify with Auth server — getSession() only reads local tokens and
        // still looks valid after an admin deletes the user.
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;

        if (error || !data.user) {
          await redirectToSignIn();
          return;
        }

        setReady(true);
      } catch {
        if (!mounted) return;
        await redirectToSignIn();
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-50 text-sm text-gray-500">
        Checking session…
      </div>
    );
  }

  return children;
}
