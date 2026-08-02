import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AffiliateProductCard from "@/components/blogs/AffiliateProductCard";

function AffiliateDisclosure() {
  return (
    <p className="text-xs leading-relaxed text-gray-500">
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
          ? "my-10 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 md:p-6"
          : isShowcase
            ? ""
            : "mt-12 border-t border-gray-200 pt-10"
      }
      aria-label={title}
    >
      <div className={`mb-4 space-y-1 ${isShowcase ? "text-center sm:text-left" : ""}`}>
        <h2
          className={`font-heading font-bold tracking-tight text-gray-900 ${
            isRecommended
              ? "text-xl md:text-2xl"
              : isShowcase
                ? "text-3xl md:text-4xl"
                : "text-2xl md:text-[1.65rem]"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base text-gray-600 md:text-lg">
            {description}
          </p>
        ) : null}
        <AffiliateDisclosure />
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

      <div className={`mt-4 ${isShowcase ? "text-center sm:text-left" : ""}`}>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Browse all tools & supplies
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}

export default AffiliateProductsSection;
