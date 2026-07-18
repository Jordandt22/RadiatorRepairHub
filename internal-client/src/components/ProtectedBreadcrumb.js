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
};

function formatSegment(segment) {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
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
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const label = formatSegment(segment);
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
