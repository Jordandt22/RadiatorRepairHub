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
}) {
  if (!products?.length) return null;

  const isRecommended = variant === "recommended";

  return (
    <aside
      className={
        isRecommended
          ? "my-10 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 md:p-6"
          : "mt-12 border-t border-gray-200 pt-10"
      }
      aria-label={title}
    >
      <div className="mb-4 space-y-1">
        <h2
          className={`font-heading font-bold tracking-tight text-gray-900 ${
            isRecommended ? "text-xl md:text-2xl" : "text-2xl md:text-[1.65rem]"
          }`}
        >
          {title}
        </h2>
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
    </aside>
  );
}

export default AffiliateProductsSection;
