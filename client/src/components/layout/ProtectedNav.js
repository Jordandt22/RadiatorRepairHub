"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  CircleHelp,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Scale,
  Search,
  Settings,
  Shield,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const ACCOUNT_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const MAIN_ITEMS = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Pricing",
    url: "/pricing",
    icon: CircleDollarSign,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: CircleHelp,
  },
  {
    title: "Privacy Policy",
    url: "/privacy",
    icon: Shield,
  },
  {
    title: "Terms of Service",
    url: "/terms",
    icon: Scale,
  },
  {
    title: "Partner Agreement",
    url: "/partner-agreement",
    icon: Scale,
  },
  {
    title: "Support",
    url: "/contact",
    icon: LifeBuoy,
  },
];

function NavGroup({ label, items, pathname }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname.startsWith(`${item.url}/`);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.title}
                render={<Link href={item.url} />}
              >
                <Icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default function ProtectedNav() {
  const pathname = usePathname();

  return (
    <>
      <NavGroup label="Account" items={ACCOUNT_ITEMS} pathname={pathname} />
      <NavGroup label="Main" items={MAIN_ITEMS} pathname={pathname} />
    </>
  );
}
