import React from "react";
import { getBusinessOpenStatus } from "@/lib/businessHours";

function OpenStatus({ hours, timezone }) {
  const businessStatus = getBusinessOpenStatus(hours, timezone);

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
        businessStatus.color === "green"
          ? "bg-green-100 text-green-800"
          : businessStatus.color === "red"
            ? "bg-red-100 text-red-800"
            : "bg-muted text-muted-foreground"
      }`}
    >
      <div
        className={`size-2 shrink-0 rounded-full ${
          businessStatus.color === "green"
            ? "bg-green-500"
            : businessStatus.color === "red"
              ? "bg-red-500"
              : "bg-border"
        }`}
      />
      <span className="min-w-0 truncate font-medium">{businessStatus.status}</span>
    </div>
  );
}

export default OpenStatus;
