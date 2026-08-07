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

const MIN_LIMIT = 50;
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 300;

export default function EmailScrapeStartDialog({
  open,
  onOpenChange,
  onSubmit,
  submitPending = false,
  submitError = null,
  pendingCount = 0,
}) {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    if (open) {
      setLimit(DEFAULT_LIMIT);
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await onSubmit({ limit });
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!submitPending}>
        <DialogHeader>
          <DialogTitle>Start email scrape</DialogTitle>
          <DialogDescription>
            Selects businesses with a website and no email. Scrapes home,
            contact, and about pages; junk emails are discarded. Work is split
            into batches of 20.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {pendingCount.toLocaleString()} businesses pending
            </p>
            <p className="mt-1 text-muted-foreground">
              This run will process up to{" "}
              <span className="font-medium text-foreground">
                {limit.toLocaleString()}
              </span>{" "}
              businesses with a website and no email on file.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="email-scrape-limit">Scrape limit</Label>
              <span
                id="email-scrape-limit-value"
                className="tabular-nums text-sm font-semibold text-foreground"
              >
                {limit}
              </span>
            </div>
            <input
              id="email-scrape-limit"
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step={10}
              value={limit}
              disabled={submitPending}
              aria-valuemin={MIN_LIMIT}
              aria-valuemax={MAX_LIMIT}
              aria-valuenow={limit}
              aria-valuetext={`${limit} businesses`}
              aria-describedby="email-scrape-limit-value"
              onChange={(event) => setLimit(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-foreground disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{MIN_LIMIT}</span>
              <span>{MAX_LIMIT}</span>
            </div>
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitPending || pendingCount === 0}>
              {submitPending ? "Starting…" : "Start Scrape"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
