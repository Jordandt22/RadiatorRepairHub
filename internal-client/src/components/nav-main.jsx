"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import {
  replaceDashboardTab,
  subscribeToDashboardTab,
} from "@/lib/dashboardTab";

function getTabFromUrl(url, pathname, search) {
  try {
    const target = new URL(url, "http://localhost");
    if (target.pathname !== pathname) return null;
    return target.searchParams.get("tab");
  } catch {
    return null;
  }
}

function isSubItemActive(url, pathname, currentTab) {
  const tab = getTabFromUrl(url, pathname);
  if (tab == null) return false;
  return (currentTab ?? "pending") === tab;
}

export function NavMain({ items, label = "Messages" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState(
    () => searchParams.get("tab") ?? "pending",
  );

  useEffect(() => {
    setCurrentTab(searchParams.get("tab") ?? "pending");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      startTransition(() => {
        setCurrentTab(tab ?? "pending");
      });
    });
  }, []);

  const handleSubItemClick = (event, url) => {
    const target = new URL(url, window.location.origin);
    if (target.pathname !== pathname) {
      return;
    }

    event.preventDefault();
    const tab = target.searchParams.get("tab") ?? "pending";
    if (tab === currentTab) return;

    setCurrentTab(tab);
    replaceDashboardTab(tab);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger
              render={<SidebarMenuButton tooltip={item.title} />}
            >
              {item.icon}
              <span>{item.title}</span>
              {item.items?.length ? (
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              ) : null}
            </CollapsibleTrigger>
            {item.items?.length ? (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        isActive={isSubItemActive(
                          subItem.url,
                          pathname,
                          currentTab,
                        )}
                        render={
                          <Link
                            href={subItem.url}
                            scroll={false}
                            onClick={(event) =>
                              handleSubItemClick(event, subItem.url)
                            }
                          />
                        }
                      >
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            ) : null}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
