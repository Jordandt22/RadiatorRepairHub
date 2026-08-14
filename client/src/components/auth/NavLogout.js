"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { signOut } from "@/lib/auth/session";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function NavLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Log out"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer justify-center gap-2 bg-muted hover:bg-muted/80"
          >
            <LogOutIcon />
            <span>{isLoggingOut ? "Signing out…" : "Log out"}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
