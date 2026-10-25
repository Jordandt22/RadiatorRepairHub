import { Mail, MapPin, Phone } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { mapsHref } from "@/lib/maps";
import { callLabel, phoneDisplay, telHref } from "@/lib/phone";
import { streetLine } from "@/lib/seo";
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
import { ContactForm } from "./ContactForm";
import { MapEmbed } from "./MapEmbed";
import { HoursTable } from "@/components/pages/shared/HoursTable";
import { ServiceAreas } from "@/components/pages/shared/ServiceAreas";
import { RrhLink } from "@/components/pages/shared/RrhLink";

const linkClass =
  "inline-flex items-center gap-2 text-accent no-underline hover:text-accent-hover hover:underline";

function CallUsCard({ shop }) {
  if (!shop.phone?.trim()) return null;

  return (
    <div className={`${card} mt-5`}>
      <p className={h3}>{CHROME.callUs}</p>
      <p className={`${muted} mb-3`}>{CHROME.callUsBody}</p>
      <a className={linkClass} href={telHref(shop)}>
        <Phone size={18} strokeWidth={2} aria-hidden />
        {phoneDisplay(shop)}
      </a>
    </div>
  );
}

function EmailUsCard({ email }) {
  const address = email?.trim();
  if (!address) return null;

  return (
    <div className={`${card} mt-5`}>
      <p className={h3}>{CHROME.emailUs}</p>
      <p className={`${muted} mb-3`}>{CHROME.emailUsBody}</p>
      <a className={linkClass} href={`mailto:${address}`}>
        <Mail size={18} strokeWidth={2} aria-hidden />
        {address}
      </a>
    </div>
  );
}

/** Hours, address, map, and the towns covered. The open badge lives in the hero. */
function HoursLocation({ config, heading }) {
  const { hours, shop } = config;

  return (
    <div id="hours" className="scroll-mt-header md:scroll-mt-header-lg">
      {heading ? (
        <>
          <p className={eyebrow}>{CHROME.eyebrow.hours}</p>
          <h2 className={h2}>{CHROME.heading.hours}</h2>
        </>
      ) : null}
      <p className={`${muted} mb-2`}>
        <a
          href={mapsHref(config)}
          rel="noopener noreferrer"
          target="_blank"
          className="text-ink-muted no-underline hover:text-accent-hover hover:underline"
        >
          {streetLine(config)}
        </a>
      </p>
      <HoursTable hours={hours} />
      {hours.notes ? <p className={`${muted} mt-4`}>{hours.notes}</p> : null}
      <ServiceAreas className="mt-6" />
      <MapEmbed className="mt-6" />
      <div className={`${btnRow} mt-5`}>
        <a
          className={`${btnSecondary} gap-2`}
          href={mapsHref(config)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MapPin aria-hidden size={18} strokeWidth={2} />
          {CHROME.directions}
        </a>
        <a className={btnPrimary} href={telHref(shop)}>
          {callLabel(shop)}
        </a>
      </div>
    </div>
  );
}

export function ContactSection({ variant = "page" }) {
  const config = getConfig();
  const { shop, seo, contact } = config;
  const socials = Object.entries(contact.socials).filter(([, url]) => Boolean(url));
  const home = variant === "home";

  const quote = (
    <div id="contact" className="scroll-mt-header md:scroll-mt-header-lg">
      <p className={eyebrow}>{CHROME.eyebrow.contact}</p>
      <h2 className={h2}>{CHROME.heading.contact}</h2>
      <div className={card}>
        <ContactForm />
      </div>
      <CallUsCard shop={shop} />
      <EmailUsCard email={shop.email} />
      {home ? null : (
        <>
          <p className="mt-5">
            <RrhLink url={seo.rrhListingUrl} />
          </p>
          {socials.length ? (
            <ul className="mt-4 mb-0 flex list-none gap-3 p-0">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} rel="noopener noreferrer" target="_blank" className="capitalize">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );

  return (
    <section className={section} id={home ? undefined : "contact-page"}>
      <div className={`${wrap} ${split}`}>
        {home ? (
          <>
            <HoursLocation config={config} heading />
            {quote}
          </>
        ) : (
          <>
            {quote}
            <HoursLocation config={config} heading />
          </>
        )}
      </div>
    </section>
  );
}
