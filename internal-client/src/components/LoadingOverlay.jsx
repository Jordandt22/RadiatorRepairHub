"use client";

import { Loader2Icon } from "lucide-react";
import { useLoading } from "@/contexts/Loading.context";

export function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-popover px-4 py-3 text-popover-foreground shadow-sm">
        <Loader2Icon className="size-5 animate-spin" />
        <span className="text-xs text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}
