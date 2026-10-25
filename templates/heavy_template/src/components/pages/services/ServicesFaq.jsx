import { Plus } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { eyebrow, h2, h3, muted, section, wrap } from "@/lib/ui";

/**
 * Shop-wide FAQs under the full services list. Native `details` so it opens
 * without JS and stays keyboard-operable. First answer starts open.
 */
export function ServicesFaq() {
  const items = getConfig().faq?.filter((item) => item?.question && item?.answer);
  if (!items?.length) return null;

  return (
    <section
      className={`${section} border-y border-line bg-sunken`}
      id="faq"
      aria-labelledby="faq-heading"
    >
      <div className={wrap}>
        <p className={eyebrow}>{CHROME.eyebrow.faq}</p>
        <h2 id="faq-heading" className={h2}>
          {CHROME.heading.faq}
        </h2>
        <div className="mt-6 max-w-3xl border-t border-line">
          {items.map((item, i) => (
            <details
              key={item.question}
              open={i === 0}
              className="faq-item group border-b border-line"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className={`${h3} m-0`}>{item.question}</span>
                <Plus
                  size={22}
                  strokeWidth={2}
                  aria-hidden
                  className="shrink-0 text-accent-text transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <div className="pb-4">
                <p className={`${muted} m-0 max-w-prose leading-relaxed`}>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
