"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import PhoneCleanerMarkStatusDialog from "@/components/pages/phone-cleaner/PhoneCleanerMarkStatusDialog";
import PhoneCleanerStatusBadge from "@/components/pages/phone-cleaner/PhoneCleanerStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";
import { publicPhoneLineTypeLabel } from "@/lib/phoneLineType";

export default function BusinessDetailPhoneTab({
  business,
  onMarkStatus,
  markStatusPending = false,
  markStatusError = null,
  onCheckLineType,
  checkLineTypePending = false,
  checkLineTypeError = null,
}) {
  const [markOpen, setMarkOpen] = useState(false);
  const lineLabel = publicPhoneLineTypeLabel(business.phone_line_type);
  const hasPhone = Boolean(String(business.phone ?? "").trim());

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Phone status</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={() => setMarkOpen(true)}
          >
            <PencilIcon />
            Edit status
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BusinessDetailCard label="Phone">
            {business.phone ? (
              <a
                href={`tel:${business.phone}`}
                className="break-all underline underline-offset-2"
              >
                {business.phone}
              </a>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <BusinessDetailCard label="Status">
            <PhoneCleanerStatusBadge status={business.phone_status} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Marked at">
            {formatFullDate(business.phone_status_marked_at)}
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Line type</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            disabled={!hasPhone || checkLineTypePending}
            onClick={() => onCheckLineType?.()}
          >
            {checkLineTypePending ? "Checking…" : "Check line type"}
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BusinessDetailCard label="Label">
            {lineLabel || "—"}
          </BusinessDetailCard>
          <BusinessDetailCard label="Twilio type">
            {business.phone_line_type || "—"}
          </BusinessDetailCard>
          <BusinessDetailCard label="Carrier">
            {business.phone_carrier || "—"}
          </BusinessDetailCard>
          <BusinessDetailCard label="Checked at">
            {formatFullDate(business.phone_line_type_checked_at)}
          </BusinessDetailCard>
        </dl>
        {checkLineTypeError ? (
          <p className="text-sm text-destructive">{checkLineTypeError}</p>
        ) : null}
      </section>

      <PhoneCleanerMarkStatusDialog
        open={markOpen}
        onOpenChange={setMarkOpen}
        selectedCount={1}
        initialStatus={business.phone_status}
        confirmPending={markStatusPending}
        confirmError={markStatusError}
        onConfirm={async (phoneStatus) => {
          await onMarkStatus?.(phoneStatus);
          setMarkOpen(false);
        }}
      />
    </div>
  );
}
