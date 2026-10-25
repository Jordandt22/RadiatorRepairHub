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
import { h3 } from "@/lib/ui";

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

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

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
        <Image
          src={image.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-transform duration-700 ${ease} [@media(hover:hover)]:group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10"
        aria-hidden
      />
      <div className="relative flex h-full min-h-60 flex-col justify-end p-4">
        {Icon ? (
          <span className="mb-2 inline-flex size-9 items-center justify-center rounded-card bg-accent text-white">
            <Icon size={18} strokeWidth={1.5} aria-hidden />
          </span>
        ) : null}
        <Heading className={`${h3} text-white`}>{service.title}</Heading>
        <div
          className={`grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ${ease} motion-reduce:transition-none [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within:grid-rows-[1fr]`}
        >
          <div className="overflow-hidden">
            <p
              className={`m-0 pt-2 text-sm text-white/85 transition-opacity duration-500 ${ease} motion-reduce:transition-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100`}
            >
              {service.description}
            </p>
            {href ? (
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                {CHROME.learnMore}
                <ArrowRight aria-hidden size={16} strokeWidth={2} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );

  const className =
    "group relative block h-full overflow-hidden rounded-card border border-line text-inherit no-underline!";

  if (href) {
    return (
      <Link className={`${className} cursor-pointer`} href={href}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}
