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
import { EMAIL_STATUS_OPTIONS } from "@/components/pages/email-cleaner/EmailCleanerMarkStatusDialog";
import {
  ATTEMPTS_FILTERS,
  HAS_CONTACT_FILTERS,
} from "@/components/pages/email-scrape/EmailScrapeBusinessesActions";

export default function EmailScrapeBusinessesFiltersDialog({
  open,
  onOpenChange,
  hasContactFilter = null,
  attemptsFilter = null,
  statusFilter = null,
  onApply,
}) {
  const [draftContact, setDraftContact] = useState(hasContactFilter);
  const [draftAttempts, setDraftAttempts] = useState(attemptsFilter);
  const [draftStatus, setDraftStatus] = useState(statusFilter);

  useEffect(() => {
    if (!open) return;
    setDraftContact(hasContactFilter);
    setDraftAttempts(attemptsFilter);
    setDraftStatus(statusFilter);
  }, [open, hasContactFilter, attemptsFilter, statusFilter]);

  const handleApply = () => {
    onApply?.({
      hasContact: draftContact,
      attempts: draftAttempts,
      status: draftStatus,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setDraftContact(null);
    setDraftAttempts(null);
    setDraftStatus(null);
    onApply?.({
      hasContact: null,
      attempts: null,
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
            Narrow businesses by contact, scrape attempts, and review status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label>Contact</Label>
            <BusinessTierCombobox
              items={HAS_CONTACT_FILTERS}
              value={draftContact}
              onValueChange={setDraftContact}
              placeholder="All contacts"
              ariaLabel="Filter by contact"
              inputName="rrh-scrape-has-contact-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label>Attempts</Label>
            <BusinessTierCombobox
              items={ATTEMPTS_FILTERS}
              value={draftAttempts}
              onValueChange={setDraftAttempts}
              placeholder="All attempts"
              ariaLabel="Filter by scrape attempts"
              inputName="rrh-scrape-attempts-filter"
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
              inputName="rrh-scrape-status-filter"
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
