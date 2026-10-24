import { getConfig, homeTrust } from "@/lib/config";
import { muted, wrap } from "@/lib/ui";
import { CountUp } from "@/components/motion/CountUp";

/**
 * Four facts, hairline-separated on the sunken band. The Google rating lives
 * under the hero instead, so these stay years / honesty / turnaround / fleet.
 */
export function TrustStrip() {
  const items = homeTrust(getConfig());
  if (!items.length) return null;

  return (
    <section className="border-y border-line bg-sunken py-10 md:py-12" aria-label="Shop facts">
      <dl className={`${wrap} m-0 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4`}>
        {items.map((item) => (
          <div
            className="px-2 text-center md:border-l md:border-line md:first:border-l-0"
            key={item.label}
          >
            <dd className="m-0 font-display text-[2.5rem] leading-none font-bold tabular-nums text-ink md:text-5xl">
              <CountUp value={item.value}>{item.value}</CountUp>
            </dd>
            <dt className="mt-2 font-semibold text-accent">{item.label}</dt>
            {item.description ? (
              <p className={`mt-1 mb-0 text-sm ${muted}`}>{item.description}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
