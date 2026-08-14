import React from "react";
import { getBusinessOpenStatus } from "@/lib/businessHours";

function OpenStatus({ hours, timezone }) {
  if (!timezone) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-border" />
        <span className="font-medium">Hours unavailable</span>
      </div>
    );
  }

  const businessStatus = getBusinessOpenStatus(hours, timezone);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        businessStatus.color === "green"
          ? "bg-green-100 text-green-800"
          : businessStatus.color === "red"
          ? "bg-red-100 text-red-800"
          : "bg-muted text-foreground"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          businessStatus.color === "green"
            ? "bg-green-500"
            : businessStatus.color === "red"
            ? "bg-red-500"
            : "bg-muted-foreground"
        }`}
      />
      <span className="font-medium">{businessStatus.status}</span>
    </div>
  );
}

export default OpenStatus;
