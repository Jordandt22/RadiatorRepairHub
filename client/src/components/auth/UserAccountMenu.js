"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/session";

export default function UserAccountMenu({
  user,
  align = "end",
  variant = "default",
  triggerClassName = "",
  onNavigate,
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const email =
    typeof user?.email === "string" && user.email.trim()
      ? user.email.trim()
      : "";
  const isHome = variant === "home";

  const handleNavigate = () => {
    onNavigate?.();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      onNavigate?.();
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={`inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-interactive/40 ${
          isHome
            ? "hover:bg-white/15 focus-visible:ring-white/50"
            : "hover:bg-tint focus-visible:ring-primary/30"
        } ${triggerClassName}`}
        aria-label="Account menu"
      >
        <Avatar size="default" className="size-9 after:border-transparent">
          <AvatarFallback
            className={
              isHome
                ? "border border-white/55 bg-white/40 text-white"
                : "bg-primary text-primary-foreground"
            }
          >
            <User className="size-4" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-52 w-auto rounded-lg border border-border bg-card p-1 shadow-md"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-muted-foreground">
            {email || "Signed in"}
          </DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link href="/settings" onClick={handleNavigate} />}
            className="cursor-pointer"
          >
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/dashboard" onClick={handleNavigate} />}
            className="cursor-pointer"
          >
            <LayoutDashboard />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <Link href="/dashboard?tab=analytics" onClick={handleNavigate} />
            }
            className="cursor-pointer"
          >
            <BarChart3 />
            Analytics
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          <LogOut />
          {isLoggingOut ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
