import { MapPin, Phone } from "lucide-react";
import { getConfig } from "@/lib/config";
import { mapsHref } from "@/lib/maps";
import { phoneDisplay, telHref } from "@/lib/phone";

export function NapBlock() {
  const config = getConfig();
  const { shop } = config;
  return (
    <address className="m-0 whitespace-pre-line not-italic">
      <span className="inline-block text-2xl font-bold mb-2 text-ink">{shop.name}</span>
      {"\n"}
      <a
        href={mapsHref(config)}
        rel="noopener noreferrer"
        target="_blank"
        className="mb-3 inline-flex items-center gap-2 hover:underline"
      >
        <MapPin size={16} strokeWidth={2} aria-hidden className="shrink-0" />
        <span>
          {shop.address}
          <br />
          {`${shop.city}, ${shop.state} ${shop.zip}`}
        </span>
      </a>
      {"\n"}
      <a
        href={telHref(shop)}
        className="contact-link mb-3 inline-flex items-center gap-2 hover:underline"
      >
        <Phone size={16} strokeWidth={2} aria-hidden />
        {phoneDisplay(shop)}
      </a>
    </address>
  );
}
