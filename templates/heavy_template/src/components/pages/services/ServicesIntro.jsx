import { getConfig } from "@/lib/config";
import { phoneDisplay } from "@/lib/phone";
import { serviceList } from "@/lib/seo";
import { wrap } from "@/lib/ui";

const lower = (sentence) => sentence.charAt(0).toLowerCase() + sentence.slice(1);

/** First sentence only, so a proof line on a step does not land in this paragraph. */
const lead = (bullet) => {
  const cut = bullet.indexOf(". ");
  const sentence = cut === -1 ? bullet : bullet.slice(0, cut);
  return lower(sentence.replace(/\.$/, ""));
};

/** Location + services + how a visit actually goes, in one readable paragraph. */
export function ServicesIntro() {
  const config = getConfig();
  const { shop, about } = config;
  const steps = (about?.bullets ?? []).map(lead);
  const process = steps.length
    ? `Every job runs the same way: ${steps.slice(0, -1).join(", ")}, and ${steps.at(-1)}.`
    : null;

  return (
    <section className="pt-8 md:pt-section">
      <div className={wrap}>
        <p className="max-w-3xl text-sm md:text-lg leading-relaxed">
          {shop.name} repairs vehicles across {shop.city}, {shop.state}:{" "}
          {serviceList(config)}. {process} Call {phoneDisplay(shop)} and we'll
          tell you what we would check first.
        </p>
      </div>
    </section>
  );
}
