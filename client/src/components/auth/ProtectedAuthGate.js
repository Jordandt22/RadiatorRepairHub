"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ProtectedAuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!data.session) {
          const returnTo = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
          router.replace(`/signin${returnTo}`);
          return;
        }

        setReady(true);
      } catch {
        if (!mounted) return;
        router.replace("/signin");
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
