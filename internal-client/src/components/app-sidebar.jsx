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
  ImageIcon,
  MailXIcon,
  MailSearchIcon,
  UsersIcon,
  DatabaseIcon,
  HardDriveIcon,
  Table2Icon,
  GlobeIcon,
  InboxIcon,
  ActivityIcon,
  ServerIcon,
  MessageSquareIcon,
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
      url: "/dashboard?tab=inbox",
      icon: <LayoutDashboardIcon />,
      isActive: true,
      items: [
        {
          title: "Inbox",
          url: "/dashboard?tab=inbox",
          icon: <InboxIcon />,
        },
        {
          title: "Analytics",
          url: "/dashboard?tab=analytics",
          icon: <ActivityIcon />,
        },
        {
          title: "Systems",
          url: "/dashboard?tab=systems",
          icon: <ServerIcon />,
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
        {
          title: "Outreach",
          url: "/outreach?tab=all",
          icon: <MegaphoneIcon />,
        },
        {
          title: "Email Cleaner",
          url: "/email-cleaner?tab=cleaner",
          icon: <MailXIcon />,
        },
        {
          title: "Email Scrape",
          url: "/email-scrape?tab=jobs",
          icon: <MailSearchIcon />,
        },
        {
          title: "Websites",
          url: "/websites?tab=businesses",
          icon: <GlobeIcon />,
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
        {
          title: "Upload Photos",
          url: "/upload-photos?tab=jobs",
          icon: <ImageIcon />,
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
      title: "Quick Contact",
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
      title: "Inquiries",
      url: "/inquiries?tab=pending",
      icon: <InboxIcon />,
      items: [
        {
          title: "Pending",
          url: "/inquiries?tab=pending",
          icon: <ClockIcon />,
        },
        {
          title: "Resolved",
          url: "/inquiries?tab=resolved",
          icon: <CheckIcon />,
        },
        {
          title: "Dismissed",
          url: "/inquiries?tab=dismissed",
          icon: <XCircleIcon />,
        },
      ],
    },
    {
      title: "Get Listed",
      url: "/get-listed-requests?tab=pending",
      icon: <Building2Icon />,
      items: [
        {
          title: "Pending",
          url: "/get-listed-requests?tab=pending",
          icon: <ClockIcon />,
        },
        {
          title: "Listed",
          url: "/get-listed-requests?tab=listed",
          icon: <CheckIcon />,
        },
        {
          title: "Rejected",
          url: "/get-listed-requests?tab=rejected",
          icon: <XCircleIcon />,
        },
        {
          title: "Duplicate",
          url: "/get-listed-requests?tab=duplicate",
          icon: <ArchiveIcon />,
        },
      ],
    },
    {
      title: "Surveys",
      url: "/feedback-surveys?tab=all",
      icon: <MessageSquareIcon />,
      items: [
        {
          title: "All",
          url: "/feedback-surveys?tab=all",
          icon: <LayoutDashboardIcon />,
        },
        {
          title: "Quick Contact",
          url: "/feedback-surveys?tab=quick_contact",
          icon: <SendIcon />,
        },
        {
          title: "Report Info",
          url: "/feedback-surveys?tab=report_info",
          icon: <FlagIcon />,
        },
        {
          title: "Contact",
          url: "/feedback-surveys?tab=contact",
          icon: <InboxIcon />,
        },
        {
          title: "Get Listed",
          url: "/feedback-surveys?tab=get_listed",
          icon: <Building2Icon />,
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
    {
      title: "Database",
      url: "/systems/database/supabase",
      icon: <Table2Icon />,
      items: [
        {
          title: "Supabase",
          url: "/systems/database/supabase",
          icon: <Table2Icon />,
        },
      ],
    },
    {
      title: "Clients",
      url: "/systems/clients/radiatorrepairhub",
      icon: <GlobeIcon />,
      items: [
        {
          title: "RadiatorRepairHub",
          url: "/systems/clients/radiatorrepairhub",
          icon: <Wrench />,
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
          <NavMain items={data.navSystems} label="Systems" />
          <NavMain items={data.navExternal} label="External" />
        </Suspense>
      </SidebarContent>
      <NavLogout />
      <SidebarRail />
    </Sidebar>
  );
}
