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
import {
  EMAILS_SENT_FILTERS,
  SUSPICIOUS_FILTERS,
} from "@/components/pages/email-cleaner/EmailCleanerActions";
import { EMAIL_STATUS_OPTIONS } from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";

export default function EmailCleanerFiltersDialog({
  open,
  onOpenChange,
  emailsSent = null,
  suspicious = null,
  statusFilter = null,
  onApply,
}) {
  const [draftSent, setDraftSent] = useState(emailsSent);
  const [draftSuspicious, setDraftSuspicious] = useState(suspicious);
  const [draftStatus, setDraftStatus] = useState(statusFilter);

  useEffect(() => {
    if (!open) return;
    setDraftSent(emailsSent);
    setDraftSuspicious(suspicious);
    setDraftStatus(statusFilter);
  }, [open, emailsSent, suspicious, statusFilter]);

  const handleApply = () => {
    onApply?.({
      sent: draftSent,
      suspicious: draftSuspicious,
      status: draftStatus,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setDraftSent(null);
    setDraftSuspicious(null);
    setDraftStatus(null);
    onApply?.({
      sent: null,
      suspicious: null,
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
            Narrow contacts by outreach sent status, suspicion, and review
            status.
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
              inputName="rrh-cleaner-sent-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label>Suspicion</Label>
            <BusinessTierCombobox
              items={SUSPICIOUS_FILTERS}
              value={draftSuspicious}
              onValueChange={setDraftSuspicious}
              placeholder="All contacts"
              ariaLabel="Filter by suspicious contacts"
              inputName="rrh-cleaner-suspicious-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <BusinessTierCombobox
              items={EMAIL_STATUS_OPTIONS}
              value={draftStatus}
              onValueChange={setDraftStatus}
              placeholder="All statuses"
              ariaLabel="Filter by review status"
              inputName="rrh-cleaner-status-filter"
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
