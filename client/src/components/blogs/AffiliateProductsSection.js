import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AffiliateProductCard from "@/components/blogs/AffiliateProductCard";

function AffiliateDisclosure({ className = "" }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      As an Amazon Associate, RadiatorRepairHub earns from qualifying purchases.
    </p>
  );
}

export function AffiliateProductsSection({
  products,
  title,
  variant = "related",
  blogSlug,
  description = null,
}) {
  if (!products?.length) return null;

  const isRecommended = variant === "recommended";
  const isShowcase = variant === "showcase";

  return (
    <aside
      className={
        isRecommended
          ? "my-10 rounded-lg border border-border bg-tint/40 p-5 md:p-6"
          : isShowcase
            ? ""
            : "mt-12 border-t border-border pt-10"
      }
      aria-label={title}
    >
      <div
        className={`mb-4 space-y-1 ${isShowcase ? "mx-auto max-w-3xl text-center" : ""}`}
      >
        <h2
          className={`font-heading tracking-tight text-foreground ${
            isRecommended
              ? "text-xl font-bold md:text-2xl"
              : isShowcase
                ? "text-3xl font-semibold"
                : "text-2xl font-bold md:text-[1.65rem]"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={`text-base text-muted-foreground md:text-lg ${
              isShowcase ? "mx-auto max-w-3xl" : "max-w-2xl"
            }`}
          >
            {description}
          </p>
        ) : null}
        <AffiliateDisclosure
          className={isShowcase ? "mx-auto max-w-3xl" : ""}
        />
      </div>

      <div
        className={
          isRecommended
            ? "grid gap-3"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {products.map((product) => (
          <AffiliateProductCard
            key={product.id}
            product={product}
            compact={isRecommended}
            variant={variant}
            blogSlug={blogSlug}
          />
        ))}
      </div>

      <div className={`mt-6 ${isShowcase ? "text-center" : ""}`}>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive transition-colors hover:text-primary"
        >
          Browse all tools & supplies
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

export default AffiliateProductsSection;
