"use client";

import * as React from "react";
import {
  Wrench,
  MailIcon,
  Building2Icon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  SendIcon,
  ArchiveIcon,
  CircleCheckIcon,
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
      url: "/dashboard?tab=pending",
      icon: <MailIcon />,
      isActive: true,
      items: [
        {
          title: "Pending",
          url: "/dashboard?tab=pending",
          icon: <ClockIcon />,
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
          title: "Result",
          url: "/dashboard?tab=result",
          icon: <CircleCheckIcon />,
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
