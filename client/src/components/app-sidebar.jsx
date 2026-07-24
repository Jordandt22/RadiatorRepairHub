"use client";

import Link from "next/link";
import { GalleryVerticalEndIcon } from "lucide-react";
import ProtectedNav from "@/components/layout/ProtectedNav";
import NavLogout from "@/components/auth/NavLogout";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="RadiatorRepairHub"
              render={<Link href="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-blue-500 text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">RadiatorRepairHub</span>
                <span className="truncate text-xs text-muted-foreground">
                  Owner portal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ProtectedNav />
      </SidebarContent>
      <NavLogout />
      <SidebarRail />
    </Sidebar>
  );
}
