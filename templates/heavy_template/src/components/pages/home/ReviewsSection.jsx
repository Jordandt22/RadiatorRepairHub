import dynamic from "next/dynamic";
import { ArrowRight, Star } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig, homeReviews } from "@/lib/config";
import { googleReviewsHref, googleWriteReviewHref } from "@/lib/maps";
import { btnPrimary, btnRow, btnSecondary, eyebrow, h2, wrap } from "@/lib/ui";
import { StarRow } from "@/components/pages/shared/StarRow";
import { OpensInNewTab } from "@/components/pages/shared/OpensInNewTab";
import { ReviewQrButton } from "./ReviewQrButton";

const ReviewCarousel = dynamic(
  () => import("./ReviewCarousel").then((m) => m.ReviewCarousel),
  { ssr: true },
);

export function ReviewsSection() {
  const config = getConfig();
  const items = homeReviews(config);
  if (!items.length) return null;
  const { reviews } = config;
  const googleHref = googleReviewsHref(config);
  const writeHref = googleWriteReviewHref(config);
  const subline =
    reviews.rating != null && reviews.count != null
      ? `${reviews.rating} stars from ${reviews.count} Google reviews`
      : null;

  return (
    <section
      className="scroll-mt-header border-y border-line bg-sunken py-section md:scroll-mt-header-lg md:py-section-lg"
      id="reviews"
    >
      <div className={wrap}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={eyebrow}>{CHROME.eyebrow.reviews}</p>
            <h2 className={h2}>{CHROME.heading.reviews}</h2>
            {subline ? (
              <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1">
                <StarRow rating={reviews.rating} />
                <span className="text-ink-muted tabular-nums">{subline}</span>
              </p>
            ) : null}
          </div>
          <ReviewQrButton url={writeHref} />
        </div>

        <ReviewCarousel items={items} />

        {writeHref || googleHref ? (
          <div className={`${btnRow} mt-8`}>
            {writeHref ? (
              <a
                className={`${btnPrimary} gap-2`}
                href={writeHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Star aria-hidden size={18} strokeWidth={2} />
                {CHROME.leaveReview}
                <OpensInNewTab />
              </a>
            ) : null}
            {googleHref ? (
              <a
                className={`${btnSecondary} gap-2`}
                href={googleHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                {CHROME.viewAllOnGoogle}
                <ArrowRight aria-hidden size={18} strokeWidth={2} />
                <OpensInNewTab />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
