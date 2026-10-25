"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { headerHoursStatus } from "@/lib/hours";

export function HeaderHours({ hours }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const update = () => setStatus(headerHoursStatus(hours));
    update();
    const id = setInterval(update, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hours]);

  if (!status) return null;

  const schedule = status.hours ? `${status.day} ${status.hours}` : status.day;
  const openLabel =
    status.open === null ? null : status.open ? CHROME.hoursOpen : CHROME.hoursClosed;

  return (
    <p className="m-0 ml-auto inline-flex max-w-full items-center gap-1.5 text-ink max-sm:ml-0">
      <Clock size={20} strokeWidth={1.5} aria-hidden />
      <span>{schedule}</span>
      {openLabel ? (
        <>
          <span aria-hidden>·</span>
          <span className={status.open ? "font-semibold text-emerald-400" : "font-semibold text-accent-text"}>
            {openLabel}
          </span>
        </>
      ) : null}
    </p>
  );
}
