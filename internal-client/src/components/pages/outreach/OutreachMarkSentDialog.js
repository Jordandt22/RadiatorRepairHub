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
import { OUTREACH_TYPE_OPTIONS } from "@/components/pages/outreach/outreachConstants";

export default function OutreachMarkSentDialog({
  open,
  onOpenChange,
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
  confirmError = null,
}) {
  const [outreachType, setOutreachType] = useState(null);

  useEffect(() => {
    if (open) {
      setOutreachType(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!outreachType?.id) return;
    onConfirm?.(outreachType.id);
  };

  const countLabel =
    selectedCount === 1
      ? "1 selected business"
      : `${selectedCount} selected businesses`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (confirmPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!confirmPending}>
        <DialogHeader>
          <DialogTitle>Mark sent</DialogTitle>
          <DialogDescription>
            Record outreach history for {countLabel} without sending email.
            Eligibility rules match Sender for the type you choose.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          <Label>Campaign type</Label>
          <BusinessTierCombobox
            items={OUTREACH_TYPE_OPTIONS}
            value={outreachType}
            onValueChange={setOutreachType}
            placeholder="Select campaign type"
            ariaLabel="Outreach campaign type to mark sent"
            inputName="rrh-outreach-mark-sent-type"
            disabled={confirmPending}
          />
        </div>

        {confirmError ? (
          <p className="text-sm text-destructive">{confirmError}</p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={confirmPending}
            className="cursor-pointer rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              confirmPending || selectedCount === 0 || !outreachType?.id
            }
            className="cursor-pointer rounded-full"
            onClick={handleConfirm}
          >
            {confirmPending ? "Saving…" : "Mark Sent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
