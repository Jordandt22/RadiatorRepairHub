"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmailScrapeMarkSuspiciousDialog({
  open,
  onOpenChange,
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
  confirmError = null,
}) {
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
          <DialogTitle>Mark suspicious?</DialogTitle>
          <DialogDescription>
            This will set the contact review status to Suspicious for{" "}
            {countLabel}. Claiming and Quick Contact will be paused for those
            listings.
          </DialogDescription>
        </DialogHeader>

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
            disabled={confirmPending || selectedCount === 0}
            className="cursor-pointer rounded-full"
            onClick={onConfirm}
          >
            {confirmPending ? "Saving…" : "Mark Suspicious"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
