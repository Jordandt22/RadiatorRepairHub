"use client";

import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SystemsHealthCheckSection from "@/components/pages/systems/SystemsHealthCheckSection";
import { useSite } from "@/contexts/Site.context";

export default function OverviewSystemsPanel({ enabled = true }) {
  const { activeSite } = useSite();
  const webUrl = activeSite?.webUrl || null;

  const systemLinks = [
    {
      href: "/systems/cache/redis",
      label: "Redis cache",
    },
    {
      href: "/systems/database/supabase",
      label: "Supabase",
    },
    {
      href: "/systems/clients/website",
      label: activeSite?.name || "Public website",
    },
  ];

  if (!enabled) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {systemLinks.map((link) => (
          <Button
            key={link.href}
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            nativeButton={false}
            render={<Link href={link.href} />}
          >
            <ExternalLinkIcon />
            {link.label}
          </Button>
        ))}
      </div>

      <SystemsHealthCheckSection
        checkId="redis"
        title="Redis"
        description="Cache server reachability from the API."
        enabled={enabled}
      />
      <SystemsHealthCheckSection
        checkId="database"
        title="Supabase"
        description="Database reachability via a lightweight query."
        enabled={enabled}
      />
      <SystemsHealthCheckSection
        checkId="website"
        title={activeSite?.name || "Public website"}
        description="Public website availability."
        externalUrl={webUrl}
        externalLabel="Open site"
        enabled={enabled}
      />
    </div>
  );
}
