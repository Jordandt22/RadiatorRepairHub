import { MapPin, Phone } from "lucide-react";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { mapsHref } from "@/lib/maps";
import { callLabel, telHref } from "@/lib/phone";

const action =
  "flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 text-sm font-semibold tracking-wide whitespace-nowrap no-underline!";

/** Call and directions within thumb reach on mobile. Hidden from md up. */
export function StickyCallBar() {
  const config = getConfig();
  const { shop } = config;
  const phone = shop.phone?.trim();
  const directions = mapsHref(config);
  if (!phone && !directions) return null;

  return (
    <div className="fixed inset-x-2 bottom-2 z-30 rounded-md p-2 bg-sunken/90 backdrop-blur-md flex h-14 flex-row gap-2 justify-between items-center shadow-md md:hidden">
      {phone ? (
        <a className={`${action} h-full bg-accent text-white! rounded-md`} href={telHref(shop)}>
          <Phone aria-hidden size={18} strokeWidth={2} />
          {callLabel(shop)}
        </a>
      ) : null}
      {directions ? (
        <a
          className={`${action} h-full bg-surface text-ink rounded-md`}
          href={directions}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MapPin aria-hidden size={18} strokeWidth={2} />
          {CHROME.directions}
        </a>
      ) : null}
    </div>
  );
}
