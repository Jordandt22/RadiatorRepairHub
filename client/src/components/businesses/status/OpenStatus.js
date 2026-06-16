"use client";

import React, { useEffect, useState } from "react";
import { getBusinessOpenStatus } from "@/lib/businessHours";
import { resolveTimezone } from "@/lib/timezoneCache";

function OpenStatus({ hours, latitude, longitude }) {
  const [businessStatus, setBusinessStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const timezone = await resolveTimezone(latitude, longitude);
      if (cancelled) return;

      setBusinessStatus(getBusinessOpenStatus(hours, timezone));
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [hours, latitude, longitude]);

  if (!businessStatus) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-400">
        <div className="w-2 h-2 rounded-full bg-gray-300" />
        <span className="font-medium">...</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        businessStatus.color === "green"
          ? "bg-green-100 text-green-800"
          : businessStatus.color === "red"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          businessStatus.color === "green"
            ? "bg-green-500"
            : businessStatus.color === "red"
            ? "bg-red-500"
            : "bg-gray-500"
        }`}
      />
      <span className="font-medium">{businessStatus.status}</span>
    </div>
  );
}

export default OpenStatus;
