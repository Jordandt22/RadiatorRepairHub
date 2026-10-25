import { getConfig } from "@/lib/config";
import { phoneDisplay } from "@/lib/phone";
import { serviceList } from "@/lib/seo";
import { wrap } from "@/lib/ui";

const lower = (sentence) => sentence.charAt(0).toLowerCase() + sentence.slice(1);

/** Location + services + how a visit actually goes, in one readable paragraph. */
export function ServicesIntro() {
  const config = getConfig();
  const { shop, about } = config;
  const steps = (about?.bullets ?? []).map(lower);
  const process = steps.length
    ? `Every job runs the same way: ${steps.slice(0, -1).join(", ")}, and ${steps.at(-1)}.`
    : null;

  return (
    <section className="pt-8 md:pt-section-lg">
      <div className={wrap}>
        <p className="max-w-3xl text-sm md:text-lg leading-relaxed">
          {shop.name} works on cooling systems across {shop.city}, {shop.state} —{" "}
          {serviceList(config)}. {process} Nothing gets replaced because it was easier
          than testing it. Call {phoneDisplay(shop)} and we'll tell you what we would
          check first.
        </p>
      </div>
    </section>
  );
}
