import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Flame,
  Gauge,
  RefreshCw,
  Snowflake,
  Thermometer,
  Truck,
  Wrench,
} from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { card, cardHover, h3, muted } from "@/lib/ui";

const ICONS = {
  thermometer: Thermometer,
  "refresh-cw": RefreshCw,
  droplets: Droplets,
  snowflake: Snowflake,
  flame: Flame,
  truck: Truck,
  wrench: Wrench,
  gauge: Gauge,
};

export function ServiceCard({
  service,
  href,
  image,
  heading: Heading = "h3",
}) {
  const Icon = service.icon ? ICONS[service.icon] : undefined;
  const body = (
    <>
      {image ? (
        <div className="relative -mx-5 -mt-5 mb-4 aspect-16/9 overflow-hidden border-b border-line">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      {Icon ? (
        <span className="mb-3 inline-flex size-11 items-center justify-center rounded-card bg-accent text-white">
          <Icon size={24} strokeWidth={1.5} aria-hidden />
        </span>
      ) : null}
      <Heading className={`${h3} text-ink`}>{service.title}</Heading>
      <p className={`${muted} m-0`}>{service.description}</p>
    </>
  );

  if (href) {
    return (
      <Link className={`${card} ${cardHover} block h-full text-inherit no-underline!`} href={href}>
        {body}
        <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent">
          {CHROME.learnMore}
          <ArrowRight aria-hidden size={18} strokeWidth={2} />
        </span>
      </Link>
    );
  }

  return <article className={`${card} ${cardHover} h-full`}>{body}</article>;
}
