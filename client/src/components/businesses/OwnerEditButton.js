"use client";

import { Pencil } from "lucide-react";
import { Button } from "../ui/button";

export default function OwnerEditButton({
  className = "",
  "aria-label": ariaLabel = "Edit section",
  onClick,
  disabled = false,
}) {
  return (
    <Button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-tint hover:text-primary disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <Pencil className="size-4" />
    </Button>
  );
}
