"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
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
  triggerClassName = "",
  onNavigate,
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const email =
    typeof user?.email === "string" && user.email.trim()
      ? user.email.trim()
      : "";

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
        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full outline-none ${triggerClassName}`}
        aria-label="Account menu"
      >
        <Avatar size="lg" className="cursor-pointer hover:scale-90 hover:opacity-75 transition-all duration-300">
          <AvatarFallback className="bg-blue-600 text-white">
            <User className="size-5" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-52 w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate normal-case tracking-normal text-xs">
            {email || "Signed in"}
          </DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link href="/settings" onClick={handleNavigate} />}
            className="cursor-pointer hover:bg-gray-200"
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
