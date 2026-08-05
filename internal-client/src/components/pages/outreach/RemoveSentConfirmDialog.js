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

export default function RemoveSentConfirmDialog({
  open,
  onOpenChange,
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
}) {
  const countLabel =
    selectedCount === 1
      ? "1 selected send"
      : `${selectedCount} selected sends`;

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
          <DialogTitle>Remove sent status?</DialogTitle>
          <DialogDescription>
            This deletes {countLabel} from outreach history so those businesses
            can be emailed again for that campaign. The recipient snapshot is
            removed with the history row. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

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
            variant="destructive"
            disabled={confirmPending || selectedCount === 0}
            className="cursor-pointer rounded-full"
            onClick={onConfirm}
          >
            {confirmPending ? "Removing…" : "Remove Sent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
