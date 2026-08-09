"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export default function MarkListedDialog({
  open,
  onOpenChange,
  businessName = "",
  selectedCount = 0,
  onConfirm,
  confirmPending = false,
  submitError = null,
  onClearSubmitError,
}) {
  const [businessSlug, setBusinessSlug] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setBusinessSlug("");
      setError(null);
    }
  }, [open]);

  const displayError = error || submitError;

  const previewUrl = businessSlug.trim()
    ? `https://radiatorrepairhub.com/business/${businessSlug.trim()}`
    : null;

  const clearErrors = () => {
    if (error) setError(null);
    if (submitError) onClearSubmitError?.();
  };

  const handleConfirm = () => {
    const slug = businessSlug.trim();
    if (!slug) {
      setError("Business slug is required");
      return;
    }
    if (!SLUG_PATTERN.test(slug)) {
      setError("Enter a valid business slug");
      return;
    }
    setError(null);
    onClearSubmitError?.();
    onConfirm(slug);
  };

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
          <DialogTitle>Mark as listed</DialogTitle>
          <DialogDescription>
            Enter the live business slug for{" "}
            {businessName ? (
              <span className="font-medium text-foreground">{businessName}</span>
            ) : (
              "this listing request"
            )}
            . It will be used in the “listing is live” email
            {selectedCount > 1 ? ` for ${selectedCount} selected requests` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          <Label htmlFor="business-slug">Business slug</Label>
          <Input
            id="business-slug"
            value={businessSlug}
            onChange={(event) => {
              setBusinessSlug(event.target.value);
              clearErrors();
            }}
            placeholder="east-coast-auto-care-llc-..."
            disabled={confirmPending}
            autoFocus
            aria-invalid={Boolean(displayError)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleConfirm();
              }
            }}
          />
          {previewUrl ? (
            <p className="break-all text-xs text-muted-foreground">
              Listing URL: {previewUrl}
            </p>
          ) : null}
          {displayError ? (
            <p className="text-sm text-destructive">{displayError}</p>
          ) : null}
        </div>

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
            onClick={handleConfirm}
          >
            {confirmPending ? "Marking…" : "Mark Listed & Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
