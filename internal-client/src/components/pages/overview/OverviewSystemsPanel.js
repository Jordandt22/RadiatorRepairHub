"use client";

import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SystemsHealthCheckSection from "@/components/pages/systems/SystemsHealthCheckSection";

const SYSTEM_LINKS = [
  {
    href: "/systems/cache/redis",
    label: "Redis cache",
  },
  {
    href: "/systems/database/supabase",
    label: "Supabase",
  },
  {
    href: "/systems/clients/radiatorrepairhub",
    label: "RadiatorRepairHub",
  },
];

export default function OverviewSystemsPanel({ enabled = true }) {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || null;

  if (!enabled) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {SYSTEM_LINKS.map((link) => (
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
        title="RadiatorRepairHub"
        description="Public website availability."
        externalUrl={webUrl}
        externalLabel="Open site"
        enabled={enabled}
      />
    </div>
  );
}
