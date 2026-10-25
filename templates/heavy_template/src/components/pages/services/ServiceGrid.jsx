import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig, homeServices } from "@/lib/config";
import { eyebrow, grid3, h2, muted, section, wrap } from "@/lib/ui";
import { StaggerChildren } from "@/components/motion/StaggerChildren";
import { ServiceCard } from "./ServiceCard";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Last tile of the grid: the jobs the list does not name. */
function AskTile({ heading: Heading = "h3" }) {
  return (
    <Link
      className="group relative flex h-full min-h-60 cursor-pointer flex-col justify-between overflow-hidden rounded-card border border-accent p-4 text-white! no-underline! hover:scale-98 transition-all duration-300"
      href="/contact"
    >
      <div
        className={`absolute inset-0 bg-accent transition-transform duration-700 ${ease} [@media(hover:hover)]:group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        aria-hidden
      />
      <div className="relative">
        <Heading className="mb-1.5 text-xl font-semibold leading-snug text-balance">
          {CHROME.missingService}
        </Heading>
        <p className="m-0 text-sm text-white/85">{CHROME.askATechBody}</p>
      </div>
      <span className="relative mt-4 inline-flex items-center gap-1.5 font-semibold">
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
                image={photos.length ? photos[i % photos.length] : undefined}
                href={!all && service.slug ? `/services#${service.slug}` : undefined}
              />
            </div>
          ))}
          {all ? <AskTile heading="h2" key="ask" /> : null}
        </StaggerChildren>
        {all ? null : (
          <p className="mt-6">
            <Link className="inline-flex items-center gap-1.5 font-semibold" href="/services">
              {CHROME.seeAllServices}
              <ArrowRight aria-hidden size={18} strokeWidth={2} />
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
