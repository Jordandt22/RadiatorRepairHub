"use client";

import DigestSchedulePanel from "@/components/pages/digest/DigestSchedulePanel";
import { useAuth } from "@/contexts/Auth.context";

export default function DigestPage() {
  const { accessToken, isReady, logout } = useAuth();

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Weekly digest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schedule weekly listing activity emails for unclaimed and claimed shops.
        </p>
      </div>
      <DigestSchedulePanel
        accessToken={accessToken}
        isReady={isReady}
        logout={logout}
      />
    </div>
  );
}
