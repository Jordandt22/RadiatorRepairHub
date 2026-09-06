"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import { EMAILS_SENT_FILTERS } from "@/components/pages/phone-cleaner/PhoneCleanerActions";
import { PHONE_STATUS_OPTIONS } from "@/components/pages/phone-cleaner/PhoneCleanerMarkStatusDialog";
import { HAS_PHONE_FILTERS } from "@/components/pages/phone-cleaner/PhoneCleanerReviewActions";

export default function PhoneCleanerReviewFiltersDialog({
  open,
  onOpenChange,
  emailsSent = null,
  hasPhone = null,
  statusFilter = null,
  onApply,
}) {
  const [draftSent, setDraftSent] = useState(emailsSent);
  const [draftHasPhone, setDraftHasPhone] = useState(hasPhone);
  const [draftStatus, setDraftStatus] = useState(statusFilter);

  useEffect(() => {
    if (!open) return;
    setDraftSent(emailsSent);
    setDraftHasPhone(hasPhone);
    setDraftStatus(statusFilter);
  }, [open, emailsSent, hasPhone, statusFilter]);

  const handleApply = () => {
    onApply?.({
      sent: draftSent,
      hasPhone: draftHasPhone,
      status: draftStatus,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setDraftSent(null);
    setDraftHasPhone(null);
    setDraftStatus(null);
    onApply?.({
      sent: null,
      hasPhone: null,
      status: null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>
            Narrow businesses by outreach sent, phone, and review status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label>Outreach sent</Label>
            <BusinessTierCombobox
              items={EMAILS_SENT_FILTERS}
              value={draftSent}
              onValueChange={setDraftSent}
              placeholder="All sent status"
              ariaLabel="Filter by sent status"
              inputName="rrh-phone-cleaner-review-sent-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <BusinessTierCombobox
              items={HAS_PHONE_FILTERS}
              value={draftHasPhone}
              onValueChange={setDraftHasPhone}
              placeholder="All phones"
              ariaLabel="Filter by phone"
              inputName="rrh-phone-cleaner-review-has-phone-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <BusinessTierCombobox
              items={PHONE_STATUS_OPTIONS}
              value={draftStatus}
              onValueChange={setDraftStatus}
              placeholder="All statuses"
              ariaLabel="Filter by review status"
              inputName="rrh-phone-cleaner-review-status-filter"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-full"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-full"
            onClick={handleApply}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
