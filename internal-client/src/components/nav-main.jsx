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
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";

function getTabFromUrl(url, pathname) {
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

function isLeafItemActive(url, pathname) {
  try {
    const target = new URL(url, "http://localhost");
    return target.pathname === pathname;
  } catch {
    return false;
  }
}

function NavCollapsibleSection({
  item,
  sectionActive,
  currentTab,
  pathname,
  onSubItemClick,
}) {
  const [open, setOpen] = useState(() => Boolean(sectionActive));

  useEffect(() => {
    if (sectionActive) {
      setOpen(true);
    }
  }, [sectionActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} />}
      >
        {item.icon}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
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
                    onClick={(event) => onSubItemClick(event, subItem.url)}
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
    </Collapsible>
  );
}

export function NavMain({ items, label = "Platform" }) {
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
    replaceTab(tab, pathname);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length);
          const isPlaceholder = !item.url || item.url === "#";

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                {isPlaceholder ? (
                  <SidebarMenuButton tooltip={item.title} disabled>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isLeafItemActive(item.url, pathname)}
                    render={<Link href={item.url} scroll={false} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          }

          const sectionActive =
            item.isActive ||
            item.items.some((subItem) => {
              try {
                return (
                  new URL(subItem.url, "http://localhost").pathname === pathname
                );
              } catch {
                return false;
              }
            });

          return (
            <NavCollapsibleSection
              key={item.title}
              item={item}
              sectionActive={sectionActive}
              currentTab={currentTab}
              pathname={pathname}
              onSubItemClick={handleSubItemClick}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
