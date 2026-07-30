"use client";

import * as React from "react";
import { Suspense } from "react";
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
  BadgeCheckIcon,
  XCircleIcon,
  TimerOffIcon,
  LayoutDashboardIcon,
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
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: true,
      items: [],
    },
    {
      title: "Contact Form",
      url: "/contact-form?tab=pending",
      icon: <MailIcon />,
      items: [
        {
          title: "Pending",
          url: "/contact-form?tab=pending",
          icon: <ClockIcon />,
        },
        {
          title: "Approved",
          url: "/contact-form?tab=approved",
          icon: <CheckIcon />,
        },
        {
          title: "Sent",
          url: "/contact-form?tab=sent",
          icon: <SendIcon />,
        },
        {
          title: "Result",
          url: "/contact-form?tab=result",
          icon: <CircleCheckIcon />,
        },
        {
          title: "Flagged",
          url: "/contact-form?tab=flagged",
          icon: <FlagIcon />,
        },
        {
          title: "Archived",
          url: "/contact-form?tab=archived",
          icon: <ArchiveIcon />,
        },
      ],
    },
    {
      title: "Claim Requests",
      url: "/claim-requests?tab=pending",
      icon: <BadgeCheckIcon />,
      items: [
        {
          title: "Pending",
          url: "/claim-requests?tab=pending",
          icon: <ClockIcon />,
        },
        {
          title: "Success",
          url: "/claim-requests?tab=success",
          icon: <CheckIcon />,
        },
        {
          title: "Failed",
          url: "/claim-requests?tab=failed",
          icon: <XCircleIcon />,
        },
        {
          title: "Expired",
          url: "/claim-requests?tab=expired",
          icon: <TimerOffIcon />,
        },
      ],
    },
    {
      title: "Listing Reports",
      url: "/listing-reports?tab=pending",
      icon: <FlagIcon />,
      items: [
        {
          title: "Pending",
          url: "/listing-reports?tab=pending",
          icon: <ClockIcon />,
        },
        {
          title: "Resolved",
          url: "/listing-reports?tab=resolved",
          icon: <CheckIcon />,
        },
        {
          title: "Dismissed",
          url: "/listing-reports?tab=dismissed",
          icon: <XCircleIcon />,
        },
      ],
    },
    {
      title: "Businesses",
      url: "/businesses?tab=all",
      icon: <Building2Icon />,
      items: [
        {
          title: "All",
          url: "/businesses?tab=all",
          icon: <Building2Icon />,
        },
        {
          title: "Claimed",
          url: "/businesses?tab=claimed",
          icon: <BadgeCheckIcon />,
        },
      ],
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
        <Suspense fallback={null}>
          <NavMain items={data.navMain} label="Platform" />
        </Suspense>
      </SidebarContent>
      <NavLogout />
      <SidebarRail />
    </Sidebar>
  );
}
