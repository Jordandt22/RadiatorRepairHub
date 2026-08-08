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

export const EMAIL_STATUS_OPTIONS = [
  { id: "suspicious", label: "Suspicious" },
  { id: "checked", label: "Checked" },
  { id: "unable_to_find", label: "Unable to Find" },
  { id: "not_checked", label: "Not Checked" },
];

export const EMAIL_STATUS_LABELS = {
  suspicious: "Suspicious",
  checked: "Checked",
  unable_to_find: "Unable to Find",
  not_checked: "Not Checked",
};

export default function EmailCleanerMarkStatusDialog({
  open,
  onOpenChange,
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
  confirmError = null,
}) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (open) {
      setStatus(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!status?.id) return;
    onConfirm?.(status.id);
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
          <DialogTitle>Mark status</DialogTitle>
          <DialogDescription>
            Set the contact review status for {countLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          <Label>Status</Label>
          <BusinessTierCombobox
            items={EMAIL_STATUS_OPTIONS}
            value={status}
            onValueChange={setStatus}
            placeholder="Select status"
            ariaLabel="Contact review status"
            inputName="rrh-cleaner-mark-status"
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
            disabled={confirmPending || selectedCount === 0 || !status?.id}
            className="cursor-pointer rounded-full"
            onClick={handleConfirm}
          >
            {confirmPending ? "Saving…" : "Mark Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
