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
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition-all hover:scale-105 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 ${className}`}
    >
      <Pencil className="size-4" />
    </Button>
  );
}
