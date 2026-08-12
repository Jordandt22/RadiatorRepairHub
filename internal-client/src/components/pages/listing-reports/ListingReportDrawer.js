import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ListingReportStatusBadge from "@/components/pages/listing-reports/ListingReportStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

const REASON_LABELS = {
  wrong_claim_contact: "Wrong claim contact",
  incorrect_outdated: "Incorrect or outdated info",
  inappropriate: "Inappropriate or misleading content",
};

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function ListingReportDrawer({ report, open, onOpenChange }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {report?.business?.title || "Listing report"}
          </DrawerTitle>
          <DrawerDescription>Listing report details</DrawerDescription>
        </DrawerHeader>

        {report ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Business">
                {report.business?.id ? (
                  <Link
                    href={`/businesses/${report.business.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {report.business.title || "View business"}
                  </Link>
                ) : report.business?.title ? (
                  report.business.title
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Listed address">
                {report.business?.address || "—"}
              </DetailRow>
              <DetailRow label="Listed phone">
                {report.business?.phone || "—"}
              </DetailRow>
              <DetailRow label="Listed email">
                {report.business?.email ? (
                  <a
                    href={`mailto:${report.business.email}`}
                    className="underline underline-offset-2"
                  >
                    {report.business.email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Claimed">
                {report.business?.is_claimed ? "Yes" : "No"}
              </DetailRow>
              <DetailRow label="Reason">
                {REASON_LABELS[report.reason] ?? report.reason ?? "—"}
              </DetailRow>
              <DetailRow label="Status">
                <ListingReportStatusBadge status={report.status} />
              </DetailRow>
              <DetailRow label="Reporter name">
                {report.reporter_name || "—"}
              </DetailRow>
              <DetailRow label="Reporter email">
                {report.reporter_email ? (
                  <a
                    href={`mailto:${report.reporter_email}`}
                    className="underline underline-offset-2"
                  >
                    {report.reporter_email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Suggested phone">
                {report.suggested_phone || "—"}
              </DetailRow>
              <DetailRow label="Suggested email">
                {report.suggested_email ? (
                  <a
                    href={`mailto:${report.suggested_email}`}
                    className="underline underline-offset-2"
                  >
                    {report.suggested_email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Details">
                <p className="whitespace-pre-wrap">{report.details || "—"}</p>
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(report.created_at)}
              </DetailRow>
              <DetailRow label="Resolved at">
                {formatFullDate(report.resolved_at)}
              </DetailRow>
              <DetailRow label="Resolved by">
                {report.resolved_by || "—"}
              </DetailRow>
              <DetailRow label="Report ID">
                <span className="break-all font-mono text-xs">
                  {report.listing_report_id}
                </span>
              </DetailRow>
              {report.business_id ? (
                <DetailRow label="Business ID">
                  <span className="break-all font-mono text-xs">
                    {report.business_id}
                  </span>
                </DetailRow>
              ) : null}
            </dl>
          </div>
        ) : null}

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
