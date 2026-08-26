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

export default function ReverseClaimConfirmDialog({
  open,
  onOpenChange,
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
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
          <DialogTitle>Reverse claim?</DialogTitle>
          <DialogDescription>
            This will set {countLabel} to unclaimed and clear the owner. Any
            active Featured Stripe subscription will be canceled immediately.
            Featured fees are non-refundable. This cannot be undone from here.
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
            {confirmPending ? "Reversing…" : "Reverse claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
