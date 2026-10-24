"use client";

import { getConfig } from "@/lib/config";
import { openStatus } from "@/lib/hours";
import { useEffect, useState } from "react";

export function OpenBadge({ className, onDark = false }) {
  const { hours } = getConfig();
  const [label, setLabel] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const status = openStatus(hours);
    if (status) {
      setOpen(status.open);
      setLabel(status.label);
    }
  }, [hours]);

  if (!label) return null;

  const tone = open
    ? "bg-emerald-600 text-white"
    : "bg-red-700 text-white";

  return (
    <p
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        tone,
        onDark ? "mt-4" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-open={open}
    >
      <span
        className="mr-1.5 size-1.5 shrink-0 rounded-full bg-white"
        aria-hidden
      />
      {label}
    </p>
  );
}
