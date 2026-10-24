import Image from "next/image";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { callLabel, phoneDisplay, telHref } from "@/lib/phone";
import { btnPrimary, btnRow, btnSecondaryOnDark, h2, wrap } from "@/lib/ui";
import { GetAQuoteLink } from "./GetAQuoteLink";

/** Closing band: faded shop photo, one line, and the phone. On every route. */
export function PageCta({ line, className = "" }) {
  const { shop, hero } = getConfig();
  const svg = hero.imagePath.endsWith(".svg");
  const heading =
    hero.headline && hero.headline.length <= 48 ? hero.headline : CHROME.ctaHeading;

  return (
    <section
      className={`relative overflow-hidden border-t border-line bg-sunken ${className}`.trim()}
    >
      <Image
        src={hero.imagePath}
        alt=""
        fill
        sizes="100vw"
        unoptimized={svg}
        className="object-cover object-center opacity-30"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.62)_100%)]"
        aria-hidden
      />
      <div className={`${wrap} relative z-10 py-section md:py-section-lg`}>
        <div className="max-w-2xl">
          <h2 className={`${h2} text-white`}>{heading}</h2>
          <p className="text-white/85">{line}</p>
          <div className={`${btnRow} mt-6`}>
            <a className={btnPrimary} href={telHref(shop)}>
              {callLabel(shop)}
            </a>
            <GetAQuoteLink className={btnSecondaryOnDark} />
          </div>
        </div>
      </div>
    </section>
  );
}
