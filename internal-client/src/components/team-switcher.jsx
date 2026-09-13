"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CheckIcon, ChevronsUpDownIcon, TruckIcon, Wrench } from "lucide-react";
import { useSite } from "@/contexts/Site.context";

const SITE_ICONS = {
  rrh: <Wrench className="size-4" />,
  drh: <TruckIcon className="size-4" />,
};

/** Landing route after a site switch: ids from the previous site do not resolve. */
const POST_SWITCH_PATH = "/dashboard?tab=inbox";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { sites, activeSite, activeSiteId, setActiveSiteId } = useSite();

  if (!activeSite) {
    return null;
  }

  const handleSelect = (siteId) => {
    if (siteId === activeSiteId) return;

    setActiveSiteId(siteId);
    router.replace(POST_SWITCH_PATH);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {SITE_ICONS[activeSite.id] ?? <Wrench className="size-4" />}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeSite.shortName}
              </span>
              <span className="truncate text-xs">{activeSite.name}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Sites
              </DropdownMenuLabel>
              {sites.map((site) => (
                <DropdownMenuItem
                  key={site.id}
                  onClick={() => handleSelect(site.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {SITE_ICONS[site.id] ?? <Wrench className="size-4" />}
                  </div>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate text-sm">{site.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {site.tagline}
                    </span>
                  </div>
                  {site.id === activeSiteId ? (
                    <CheckIcon className="size-4 shrink-0" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
