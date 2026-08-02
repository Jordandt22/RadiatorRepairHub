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
  "contact-form": "Contact Form",
  "claim-requests": "Claim Requests",
  "listing-reports": "Listing Reports",
  businesses: "Businesses",
  locations: "Locations",
  states: "States",
  cities: "Cities",
  outreach: "Outreach",
  "affiliate-programs": "Affiliate Programs",
};

const LOCATION_PARENT_HREF = {
  states: "/locations?tab=states",
  cities: "/locations?tab=cities",
  "postal-codes": "/locations?tab=postal-codes",
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

          return (
            <Fragment key={href}>
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
              <BreadcrumbItem className={!isLast ? "hidden md:block" : undefined}>
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
