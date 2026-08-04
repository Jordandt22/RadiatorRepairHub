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
  MapPinIcon,
  AlertTriangleIcon,
  MegaphoneIcon,
  HandshakeIcon,
  UploadIcon,
  MailXIcon,
  UsersIcon,
  DatabaseIcon,
  HardDriveIcon,
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
        {
          title: "Outreach",
          url: "/outreach?tab=all",
          icon: <MegaphoneIcon />,
        },
        {
          title: "Email Cleaner",
          url: "/email-cleaner",
          icon: <MailXIcon />,
        },
        {
          title: "Locations",
          url: "/locations?tab=states",
          icon: <MapPinIcon />,
        },
        {
          title: "Data Issues",
          url: "/locations?tab=data-issues",
          icon: <AlertTriangleIcon />,
        },
        {
          title: "Add Businesses",
          url: "/add-businesses?tab=groups",
          icon: <UploadIcon />,
        },
      ],
    },
    {
      title: "Users",
      url: "/users",
      icon: <UsersIcon />,
      items: [
        {
          title: "All",
          url: "/users",
          icon: <UsersIcon />,
        },
      ],
    },
  ],
  navInbox: [
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
  ],
  navExternal: [
    {
      title: "Affiliate Programs",
      url: "/affiliate-programs?tab=products",
      icon: <HandshakeIcon />,
      items: [
        {
          title: "Products",
          url: "/affiliate-programs?tab=products",
          icon: <HandshakeIcon />,
        },
      ],
    },
  ],
  navSystems: [
    {
      title: "Cache",
      url: "/systems/cache/redis",
      icon: <DatabaseIcon />,
      items: [
        {
          title: "Redis",
          url: "/systems/cache/redis",
          icon: <HardDriveIcon />,
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
          <NavMain items={data.navInbox} label="Inbox" />
          <NavMain items={data.navExternal} label="External" />
          <NavMain items={data.navSystems} label="Systems" />
        </Suspense>
      </SidebarContent>
      <NavLogout />
      <SidebarRail />
    </Sidebar>
  );
}
