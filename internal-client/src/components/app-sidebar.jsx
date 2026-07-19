"use client";

import * as React from "react";
import {
  Wrench,
  MailIcon,
  Building2Icon,
  InboxIcon,
  CheckIcon,
  FlagIcon,
  SendIcon,
  ArchiveIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import NavLogout from "@/components/NavLogout";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [
    {
      name: "RRH",
      logo: <Wrench />,
      plan: "RadiatorRepairHub",
    },
  ],
  navMain: [
    {
      title: "Contact Form",
      url: "/dashboard?tab=all",
      icon: <MailIcon />,
      isActive: true,
      items: [
        {
          title: "All",
          url: "/dashboard?tab=all",
          icon: <InboxIcon />,
        },
        {
          title: "Approved",
          url: "/dashboard?tab=approved",
          icon: <CheckIcon />,
        },
        {
          title: "Sent",
          url: "/dashboard?tab=sent",
          icon: <SendIcon />,
        },
        {
          title: "Flagged",
          url: "/dashboard?tab=flagged",
          icon: <FlagIcon />,
        },
        {
          title: "Archived",
          url: "/dashboard?tab=archived",
          icon: <ArchiveIcon />,
        },
      ],
    },
    {
      title: "Businesses",
      url: "#",
      icon: <Building2Icon />,
      items: [],
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Messages" />
      </SidebarContent>
      <NavLogout />
      <SidebarRail />
    </Sidebar>
  );
}
