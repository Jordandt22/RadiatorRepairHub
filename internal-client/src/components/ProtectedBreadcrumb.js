"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS = {
  dashboard: "Dashboard",
  "contact-form": "Quick Contact",
  "claim-requests": "Claim Requests",
  "listing-reports": "Listing Reports",
  inquiries: "Inquiries",
  "get-listed-requests": "Get Listed",
  "feedback-surveys": "Surveys",
  businesses: "Businesses",
  analytics: "Analytics",
  locations: "Locations",
  states: "States",
  cities: "Cities",
  outreach: "Outreach",
  "email-cleaner": "Email Cleaner",
  "email-scrape": "Email Scrape",
  websites: "Websites",
  users: "Users",
  testing: "Testing",
  "affiliate-programs": "Affiliate Programs",
  "add-businesses": "Add Businesses",
  "upload-photos": "Upload Photos",
  group: "Groups",
  batch: "Batch",
  systems: "Systems",
  cache: "Cache",
  redis: "Redis",
  database: "Database",
  supabase: "Supabase",
  clients: "Clients",
  radiatorrepairhub: "RadiatorRepairHub",
};

const LOCATION_PARENT_HREF = {
  states: "/locations?tab=states",
  cities: "/locations?tab=cities",
  "postal-codes": "/locations?tab=postal-codes",
};

const SEGMENT_HREF = {
  group: "/add-businesses?tab=groups",
  batch: "/add-businesses?tab=groups",
  "upload-photos": "/upload-photos?tab=jobs",
  "email-scrape": "/email-scrape?tab=jobs",
  websites: "/websites?tab=businesses",
  users: "/users",
  testing: "/testing?tab=businesses",
  businesses: "/businesses?tab=all",
  systems: "/systems/cache/redis",
  cache: "/systems/cache/redis",
};

function formatSegment(segment, index, segments) {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];

  const parent = segments[0];
  if (index === 1 && parent === "states") {
    return segment.toUpperCase();
  }
  if (index === 1 && parent === "postal-codes") {
    return decodeURIComponent(segment);
  }
  if (index === 1 && parent === "cities") {
    return decodeURIComponent(segment)
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  if (index === 1 && parent === "group") {
    return "Details";
  }
  if (index === 1 && parent === "batch") {
    return "Details";
  }
  if (index === 1 && parent === "upload-photos") {
    if (segment === "batch") return "Batch";
    return "Job";
  }
  if (index === 2 && parent === "upload-photos" && segments[1] === "batch") {
    return "Details";
  }
  if (index === 1 && parent === "email-scrape") {
    if (segment === "batch") return "Batch";
    return "Job";
  }
  if (index === 2 && parent === "email-scrape" && segments[1] === "batch") {
    return "Details";
  }
  if (index === 1 && parent === "users") {
    return "Details";
  }
  if (index === 1 && parent === "businesses") {
    return "Details";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hrefForSegment(segments, index) {
  const segment = segments[index];
  if (index === 0 && LOCATION_PARENT_HREF[segment]) {
    return LOCATION_PARENT_HREF[segment];
  }
  if (index === 0 && SEGMENT_HREF[segment]) {
    return SEGMENT_HREF[segment];
  }
  if (
    segment === "batch" &&
    segments[0] === "upload-photos" &&
    index === 1
  ) {
    return "/upload-photos?tab=jobs";
  }
  if (
    segment === "batch" &&
    segments[0] === "email-scrape" &&
    index === 1
  ) {
    return "/email-scrape?tab=jobs";
  }
  if (segment === "cache" && segments[0] === "systems") {
    return "/systems/cache/redis";
  }
  if (segment === "database" && segments[0] === "systems") {
    return "/systems/database/supabase";
  }
  if (segment === "clients" && segments[0] === "systems") {
    return "/systems/clients/radiatorrepairhub";
  }
  return `/${segments.slice(0, index + 1).join("/")}`;
}

export default function ProtectedBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="bg-sky-500/10 rounded-md px-2 py-0.5">
        {segments.map((segment, index) => {
          const href = hrefForSegment(segments, index);
          const label = formatSegment(segment, index, segments);
          const isLast = index === segments.length - 1;
          const keepVisibleOnMobile =
            (!isLast && segments[0] === "group" && index === 0) ||
            (!isLast && segments[0] === "batch" && index === 0) ||
            (!isLast && segments[0] === "users" && index === 0) ||
            (!isLast && segments[0] === "businesses" && index === 0);

          return (
            <Fragment key={`${href}-${index}`}>
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
              <BreadcrumbItem
                className={
                  !isLast && !keepVisibleOnMobile ? "hidden md:block" : undefined
                }
              >
                {isLast ? (
                  <BreadcrumbPage className="font-semibold">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="font-semibold"
                    render={<Link href={href} />}
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
