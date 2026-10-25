import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { callLabel, telHref } from "@/lib/phone";
import { btnPrimary, h1, wrap } from "@/lib/ui";

/** Inner-page band: breadcrumbs, title, one line, and the call button. */
export function PageBanner({ title, subtitle }) {
  const { hero, shop } = getConfig();
  const svg = hero.imagePath.endsWith(".svg");

  return (
    <section className="relative flex min-h-72 items-end overflow-hidden border-b border-line bg-sunken text-white md:min-h-80">
      <Image
        src={hero.imagePath}
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized={svg}
        className="object-cover object-center opacity-35"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.94)_100%)]"
        aria-hidden
      />
      <div className={`${wrap} relative z-10 py-10 md:py-12`}>
        <div className="max-w-2xl">
          <nav aria-label="Breadcrumb">
            <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-sm text-white/75">
              <li>
                <Link href="/" className="text-white! no-underline! hover:underline">
                  {CHROME.nav.home}
                </Link>
              </li>
              <li aria-hidden className="inline-flex">
                <ChevronRight size={14} strokeWidth={2} />
              </li>
              <li aria-current="page" className="text-white">
                {title}
              </li>
            </ol>
          </nav>
          <h1 className={`${h1} mt-3 text-white`}>{title}</h1>
          {subtitle ? <p className="mt-2 mb-0 text-white/85">{subtitle}</p> : null}
          <a className={`${btnPrimary} mt-6`} href={telHref(shop)}>
            {callLabel(shop)}
          </a>
        </div>
      </div>
    </section>
  );
}
