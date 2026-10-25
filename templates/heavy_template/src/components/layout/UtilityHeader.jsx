import { Mail, MapPin, Phone } from "lucide-react";
import { HeaderHours } from "@/components/layout/HeaderHours";
import { getConfig } from "@/lib/config";
import { mapsHref } from "@/lib/maps";
import { callLabel, telHref } from "@/lib/phone";
import { streetLine } from "@/lib/seo";
import { OpensInNewTab } from "@/components/pages/shared/OpensInNewTab";
import { wrap } from "@/lib/ui";

const itemClass =
  "inline-flex min-h-6 items-center gap-1.5 text-ink hover:text-ink hover:underline";

export function UtilityHeader() {
  const config = getConfig();
  const { shop, features, hours } = config;
  const showEmail = features?.showEmailInHeader && shop.email?.trim();
  return (
    <nav className="bg-accent/30 text-sm tracking-[0.01em]" aria-label="Shop contact">
      <div className={`${wrap} flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5`}>
        <a href={telHref(shop)} className={`${itemClass} max-sm:hidden`}>
          <Phone size={20} strokeWidth={1.5} aria-hidden />
          {callLabel(shop)}
        </a>
        {showEmail ? (
          <a href={`mailto:${shop.email}`} className={`${itemClass} max-sm:hidden`}>
            <Mail size={20} strokeWidth={1.5} aria-hidden />
            {shop.email}
          </a>
        ) : null}
        <a
          href={mapsHref(config)}
          rel="noopener noreferrer"
          target="_blank"
          className={`${itemClass} max-sm:hidden`}
        >
          <MapPin size={20} strokeWidth={1.5} aria-hidden />
          {streetLine(config)}
          <OpensInNewTab />
        </a>
        {features?.showHoursInHeader ? <HeaderHours hours={hours} /> : null}
      </div>
    </nav>
  );
}
