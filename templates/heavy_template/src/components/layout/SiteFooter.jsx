import Link from "next/link";
import { getConfig } from "@/lib/config";
import { CHROME, NAV_ITEMS } from "@/lib/chrome";
import { RrhLink } from "@/components/pages/shared/RrhLink";
import { NapBlock } from "@/components/pages/shared/NapBlock";
import { HoursTable } from "@/components/pages/shared/HoursTable";
import { h3, wrap } from "@/lib/ui";

export function SiteFooter() {
  const config = getConfig();
  const { shop, hours, seo, services } = config;

  return (
    <footer className="border-t border-line bg-sunken py-10 pb-12 text-sm text-ink-muted [&_a]:text-ink-muted [&_a]:no-underline [&_a]:hover:text-ink [&_th]:border-line [&_td]:border-line">
      <div className={`${wrap} grid gap-7 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
        <div>
          <NapBlock />
          <p>
            <a href={`mailto:${shop.email}`} className="hover:underline">
              {shop.email}
            </a>
          </p>
          <p>
            <RrhLink url={seo.rrhListingUrl} />
          </p>
        </div>
        <div>
          <p className={`${h3} text-white`}>{CHROME.heading.services}</p>
          <ul className="m-0 list-none p-0">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug ?? service.title} className="my-1.5">
                <Link
                  href={service.slug ? `/services#${service.slug}` : "/services"}
                  className="hover:underline"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={`${h3} text-white`}>Hours</p>
          <HoursTable hours={hours} hightlightClass="bg-accent text-white" />
        </div>
        <div>
          <p className={`${h3} text-white`}>Links</p>
          <ul className="m-0 list-none p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="my-1.5">
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="my-1.5">
              <Link href="/#reviews" className="hover:underline">
                {CHROME.reviews}
              </Link>
            </li>
            <li className="my-1.5">
              <Link href="/privacy">{CHROME.privacy}</Link>
            </li>
            <li className="my-1.5">
              <Link href="/terms">{CHROME.terms}</Link>
            </li>
          </ul>
          <p className="text-white/60" suppressHydrationWarning>
            © {new Date().getFullYear()} {shop.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
