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

export default function RedisFlushConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmPending = false,
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
          <DialogTitle>Flush entire Redis cache?</DialogTitle>
          <DialogDescription>
            This clears every key in the current Redis database, including
            public site caches. Traffic may briefly hit the database harder
            until caches rebuild. This cannot be undone.
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
            disabled={confirmPending}
            className="cursor-pointer rounded-full"
            onClick={onConfirm}
          >
            {confirmPending ? "Flushing…" : "Flush all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
