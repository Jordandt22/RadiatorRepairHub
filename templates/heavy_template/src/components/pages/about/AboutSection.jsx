import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";
import {
  btnPrimary,
  btnRow,
  btnSecondary,
  card,
  eyebrow,
  h2,
  h3,
  muted,
  section,
  split,
  wrap,
} from "@/lib/ui";
import { Reveal } from "@/components/motion/Reveal";
import { RrhLink } from "@/components/pages/shared/RrhLink";
import { StarRow } from "@/components/pages/shared/StarRow";

/**
 * Rating, years, warranty — the proof that belongs next to the story. The
 * rating is dropped on the home teaser, where the hero already states it.
 */
function ProofRow({ config, showRating }) {
  const { about, reviews, shop } = config;
  const facts = [
    showRating && reviews?.rating != null
      ? {
        label: "Google Rating",
        value: (
          <span className="inline-flex items-center gap-2">
            <StarRow rating={reviews.rating} />
            <span className="tabular-nums">{reviews.rating}</span>
          </span>
        ),
      }
      : null,
    about?.yearsInBusiness != null
      ? {
        label: `Years in ${shop.city}`,
        value: <span className="tabular-nums">{about.yearsInBusiness}</span>,
      }
      : null,
    about?.warranty ? { label: "Warranty", value: about.warranty } : null,
  ].filter(Boolean);
  if (!facts.length) return null;

  return (
    <dl className="mt-6 m-0 grid gap-4 sm:grid-cols-3">
      {facts.map((fact) => (
        <div className={card} key={fact.label}>
          <dt className={`m-0 text-sm ${muted}`}>{fact.label}</dt>
          <dd className="mt-1 mb-0 font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The demo bullets are a real sequence (drop off, test, approve, fix), so they
 * are numbered. Swap to a plain grid if a client's bullets are not ordered.
 */
function ProcessSteps({ bullets }) {
  if (bullets.length !== 4) {
    return (
      <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
        {bullets.map((bullet) => (
          <li className={`${card} border-l-4 border-l-accent`} key={bullet}>
            {bullet}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ol className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
      {bullets.map((bullet, i) => (
        <li className={card} key={bullet}>
          <p className="m-0 font-display text-3xl font-bold text-accent-text tabular-nums">
            {i + 1}
          </p>
          <p className="mt-1 mb-0 font-medium">{bullet}</p>
        </li>
      ))}
    </ol>
  );
}

export function AboutSection({ teaser = false }) {
  const config = getConfig();
  const { about, gallery, seo, shop } = config;
  const photo = gallery.images[0];

  return (
    <section className={`${section} overflow-x-clip`} id={teaser ? "about" : undefined}>
      <div className={wrap}>
        <div className={split}>
          <div>
            <p className={eyebrow}>{CHROME.eyebrow.about}</p>
            <h2 className={h2}>
              {teaser ? CHROME.heading.about : `A ${shop.city} shop that earns its keep`}
            </h2>
            <p>{about.mission}</p>
            <ProofRow config={config} showRating={!teaser} />
            <div className={`${btnRow} mt-8`}>
              <a className={btnPrimary} href={telHref(shop)}>
                {callLabel(shop)}
              </a>
              {teaser ? (
                <Link className={`${btnSecondary} gap-2`} href="/about">
                  {CHROME.aboutMore}
                  <ArrowRight aria-hidden size={18} strokeWidth={2} />
                </Link>
              ) : (
                <>
                  <Link className={`${btnSecondary} gap-2`} href="/services">
                    {CHROME.seeAllServices}
                    <ArrowRight aria-hidden size={18} strokeWidth={2} />
                  </Link>
                  <RrhLink url={seo.rrhListingUrl} />
                </>
              )}
            </div>
          </div>

          {photo ? (
            <Reveal
              variant="from-right"
              className="relative aspect-4/3 overflow-hidden rounded-card border border-line"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 36rem, 100vw"
                className="object-cover"
              />
            </Reveal>
          ) : null}
        </div>

        {about.bullets?.length ? (
          <>
            <h3 className={`${h3} mt-12`}>{CHROME.processHeading}</h3>
            <ProcessSteps bullets={about.bullets} />
          </>
        ) : null}
      </div>
    </section>
  );
}
