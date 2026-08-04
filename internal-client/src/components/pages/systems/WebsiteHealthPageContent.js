"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Auth.context";
import SystemsHealthCheckSection from "@/components/pages/systems/SystemsHealthCheckSection";

export default function WebsiteHealthPageContent() {
  const router = useRouter();
  const { accessToken, isReady } = useAuth();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || null;

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
        <h1 className="text-xl font-semibold tracking-tight">
          RadiatorRepairHub
        </h1>
        <p className="text-sm text-muted-foreground">
          Check that the main public website is responding.
        </p>
      </div>

      <SystemsHealthCheckSection
        checkId="website"
        title="Public website"
        description="Requests the site homepage from the API and verifies a successful HTTP response."
        externalUrl={webUrl}
        externalLabel="Open site"
      />
    </div>
  );
}
