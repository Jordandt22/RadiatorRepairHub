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

export default function UsersDeleteConfirmDialog({
  open,
  onOpenChange,
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
}) {
  const countLabel =
    selectedCount === 1
      ? "1 selected user"
      : `${selectedCount} selected users`;

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
          <DialogTitle>Delete users?</DialogTitle>
          <DialogDescription>
            This will permanently delete {countLabel}, release any claimed
            businesses, and remove their accounts. This cannot be undone.
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
            {confirmPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
