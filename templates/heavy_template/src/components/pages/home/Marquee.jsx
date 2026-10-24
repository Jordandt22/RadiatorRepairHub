import { getConfig } from "@/lib/config";

/**
 * Shop-sign ticker under the hero. Decorative: every word already appears in
 * the hero eyebrow or the services grid, so the whole strip is hidden from
 * assistive tech. Two identical copies make the -50% loop seamless.
 */
export function Marquee() {
  const { shop, services, about } = getConfig();
  const words = [
    ...services.map((service) => service.title),
    shop.city,
    about?.yearsInBusiness
      ? `Since ${new Date().getFullYear() - about.yearsInBusiness}`
      : null,
  ].filter(Boolean);
  if (!words.length) return null;

  const copy = (dup) =>
    words.map((word) => (
      <span className="flex items-center" key={`${dup ? "b" : "a"}-${word}`}>
        <span className="font-display text-2xl font-semibold tracking-[-0.01em] whitespace-nowrap uppercase">
          {word}
        </span>
        <span className="mx-6 size-1.5 rotate-45 bg-accent" />
      </span>
    ));

  return (
    <div
      className="overflow-hidden border-y border-line bg-surface py-3 text-ink"
      aria-hidden="true"
    >
      <div className="marquee-track flex items-center">
        <span className="flex items-center">{copy(false)}</span>
        <span className="marquee-dup flex items-center">{copy(true)}</span>
      </div>
    </div>
  );
}
