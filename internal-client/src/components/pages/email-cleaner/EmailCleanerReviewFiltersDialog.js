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
import { EMAILS_SENT_FILTERS } from "@/components/pages/email-cleaner/EmailCleanerActions";
import { EMAIL_STATUS_OPTIONS } from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";
import { HAS_EMAIL_FILTERS } from "@/components/pages/email-cleaner/EmailCleanerReviewActions";

export default function EmailCleanerReviewFiltersDialog({
  open,
  onOpenChange,
  emailsSent = null,
  hasEmail = null,
  statusFilter = null,
  onApply,
}) {
  const [draftSent, setDraftSent] = useState(emailsSent);
  const [draftHasEmail, setDraftHasEmail] = useState(hasEmail);
  const [draftStatus, setDraftStatus] = useState(statusFilter);

  useEffect(() => {
    if (!open) return;
    setDraftSent(emailsSent);
    setDraftHasEmail(hasEmail);
    setDraftStatus(statusFilter);
  }, [open, emailsSent, hasEmail, statusFilter]);

  const handleApply = () => {
    onApply?.({
      sent: draftSent,
      hasEmail: draftHasEmail,
      status: draftStatus,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setDraftSent(null);
    setDraftHasEmail(null);
    setDraftStatus(null);
    onApply?.({
      sent: null,
      hasEmail: null,
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
            Narrow businesses by outreach sent, contact, and review status.
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
              inputName="rrh-cleaner-review-sent-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label>Contact</Label>
            <BusinessTierCombobox
              items={HAS_EMAIL_FILTERS}
              value={draftHasEmail}
              onValueChange={setDraftHasEmail}
              placeholder="All contacts"
              ariaLabel="Filter by contact"
              inputName="rrh-cleaner-review-has-contact-filter"
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
              inputName="rrh-cleaner-review-status-filter"
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
