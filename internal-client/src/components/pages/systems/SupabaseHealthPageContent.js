"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";
import SystemsHealthCheckSection from "@/components/pages/systems/SystemsHealthCheckSection";

export default function SupabaseHealthPageContent() {
  const router = useRouter();
  const { accessToken, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  if (!isReady || !accessToken) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:gap-10 md:px-8 md:py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Supabase</h1>
        <p className="text-sm text-muted-foreground">
          Check that the Supabase database is reachable from the API.
        </p>
      </div>

      <SystemsHealthCheckSection
        checkId="database"
        title="Supabase database"
        description="Runs a lightweight query against the businesses table using the service-role client."
      />
    </div>
  );
}
