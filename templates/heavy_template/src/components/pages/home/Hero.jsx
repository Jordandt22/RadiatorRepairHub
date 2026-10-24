import Image from "next/image";
import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";
import { wrap } from "@/lib/ui";
import { HeroCopy } from "@/components/motion/HeroCopy";
import { HeroPhoto } from "@/components/motion/HeroPhoto";
import { GoogleRatingLine } from "./GoogleRatingLine";
import { OpenBadge } from "@/components/pages/contact/OpenBadge";

export function Hero() {
  const config = getConfig();
  const { shop, hero, about } = config;
  const svg = hero.imagePath.endsWith(".svg");
  const eyebrow = about?.yearsInBusiness
    ? `${shop.city} · Est. ${new Date().getFullYear() - about.yearsInBusiness}`
    : shop.city;

  return (
    <section className="overflow-x-clip pt-section pb-section md:pt-14 md:pb-section-lg" aria-label="Introduction">
      <div className={`${wrap} grid items-center gap-8 lg:grid-cols-2 lg:gap-12`}>
        <div>
          <OpenBadge className="mb-5" />
          <HeroCopy
            eyebrow={eyebrow}
            headline={hero.headline}
            subheadline={hero.subheadline}
            callHref={telHref(shop)}
            callText={callLabel(shop)}
            showSecondaryCta={Boolean(hero.secondaryCta)}
          >
            <GoogleRatingLine className="mt-6" />
          </HeroCopy>
        </div>
        <HeroPhoto className="relative aspect-4/3 overflow-hidden rounded-card border border-line max-lg:min-h-[40vh]">
          <Image
            src={hero.imagePath}
            alt={`${shop.name} shop floor: mechanic at an open hood, fluid shelves and shop windows behind`}
            fill
            priority
            sizes="(min-width: 1024px) 40rem, 100vw"
            unoptimized={svg}
            className="object-cover object-center"
          />
        </HeroPhoto>
      </div>
    </section>
  );
}
