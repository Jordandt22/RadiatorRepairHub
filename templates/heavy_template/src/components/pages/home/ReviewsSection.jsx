import { CHROME } from "@/lib/chrome";
import { getConfig, homeReviews } from "@/lib/config";
import { googleReviewsHref, googleWriteReviewHref } from "@/lib/maps";
import { btnPrimary, btnRow, btnSecondary, eyebrow, h2, wrap } from "@/lib/ui";
import { StarRow } from "@/components/pages/shared/StarRow";
import { ReviewCarousel } from "./ReviewCarousel";
import { ReviewQrButton } from "./ReviewQrButton";

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
        <div className="flex items-start justify-between gap-4">
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
                className={btnPrimary}
                href={writeHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                {CHROME.leaveReview}
              </a>
            ) : null}
            {googleHref ? (
              <a
                className={btnSecondary}
                href={googleHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                {CHROME.viewAllOnGoogle}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
