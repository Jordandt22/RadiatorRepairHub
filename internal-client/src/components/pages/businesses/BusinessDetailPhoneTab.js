"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import PhoneCleanerMarkStatusDialog from "@/components/pages/phone-cleaner/PhoneCleanerMarkStatusDialog";
import PhoneCleanerStatusBadge from "@/components/pages/phone-cleaner/PhoneCleanerStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

export default function BusinessDetailPhoneTab({
  business,
  onMarkStatus,
  markStatusPending = false,
  markStatusError = null,
}) {
  const [markOpen, setMarkOpen] = useState(false);

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
