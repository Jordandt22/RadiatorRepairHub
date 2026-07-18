"use client";

import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function NavLogout() {
  const { logout } = useAuth();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Log out" onClick={logout} className="bg-gray-300 flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-400 hover:scale-95 transition-all duration-200">
            <LogOutIcon />
            <span>Log out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
