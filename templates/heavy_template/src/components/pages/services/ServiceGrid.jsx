import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig, homeServices } from "@/lib/config";
import { cardHover, cardShell, eyebrow, grid3, h2, h3, muted, section, wrap } from "@/lib/ui";
import { StaggerChildren } from "@/components/motion/StaggerChildren";
import { ServiceCard } from "./ServiceCard";

/** Last tile of the grid: the jobs the list does not name. */
function AskTile() {
  return (
    <Link
      className={`${cardShell} ${cardHover} flex h-full flex-col justify-between border-accent bg-accent text-white! no-underline!`}
      href="/contact"
    >
      <div>
        <h3 className={h3}>{CHROME.missingService}</h3>
        <p className="m-0 text-white/85">{CHROME.askATechBody}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 font-semibold">
        {CHROME.contactUs}
        <ArrowRight aria-hidden size={18} strokeWidth={2} />
      </span>
    </Link>
  );
}

export function ServiceGrid({ all = false, className = "" }) {
  const config = getConfig();
  const items = all ? config.services : homeServices(config);
  if (!items.length) return null;
  const photos = config.gallery?.images ?? [];

  return (
    <section
      className={`${section} ${all ? "" : "grid-lines border-y border-line"} ${className}`.trim()}
      id={all ? undefined : "services"}
    >
      <div className={wrap}>
        {all ? null : (
          <>
            <p className={eyebrow}>{CHROME.eyebrow.services}</p>
            <h2 className={h2}>{CHROME.heading.services}</h2>
            {config.shop.tagline ? <p className={muted}>{config.shop.tagline}</p> : null}
          </>
        )}
        <StaggerChildren className={`${grid3} mt-6`}>
          {items.map((service, i) => (
            <div
              id={all ? service.slug : undefined}
              key={service.slug ?? service.title}
              className="h-full scroll-mt-header md:scroll-mt-header-lg"
            >
              <ServiceCard
                service={service}
                heading={all ? "h2" : "h3"}
                image={all ? photos[i % photos.length] : undefined}
                href={!all && service.slug ? `/services#${service.slug}` : undefined}
              />
            </div>
          ))}
          <AskTile key="ask" />
        </StaggerChildren>
        {all ? null : (
          <p className="mt-6">
            <Link className="font-semibold" href="/services">
              {CHROME.seeAllServices}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
