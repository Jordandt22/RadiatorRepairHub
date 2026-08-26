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

export default function TestingDeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  confirmPending = false,
  onConfirm,
}) {
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            disabled={confirmPending}
            className="cursor-pointer rounded-full"
            onClick={onConfirm}
          >
            {confirmPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
