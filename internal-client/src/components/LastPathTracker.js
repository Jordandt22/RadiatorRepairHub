"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";
import { saveLastPath } from "@/lib/lastPath";

/** While authenticated, remember the current protected URL for post-login restore. */
export default function LastPathTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { accessToken, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !accessToken || !pathname) return;
    const search = searchParams?.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    saveLastPath(path);
  }, [isReady, accessToken, pathname, searchParams]);

  return null;
}
