"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export default function AffiliateProductCard({
  product,
  compact = false,
  variant = "related",
  blogSlug,
}) {
  const posthog = usePostHog();
  const href = product.affiliate_link || product.product_link;
  if (!href) return null;

  const handleClick = () => {
    posthog?.capture("affiliate_product_clicked", {
      product_id: product.id || undefined,
      product_title: product.title || undefined,
      provider: product.provider || undefined,
      variant,
      blog_slug: blogSlug || undefined,
      destination: product.affiliate_link ? "affiliate_link" : "product_link",
    });
  };

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleClick}
        className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-md"
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title || "Product image"}
              fill
              className="object-contain p-2"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600 md:text-lg">
            {product.title}
          </p>
          {product.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          ) : null}
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
            View on Amazon
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:translate-y-[-2px] hover:scale-105"
    >
      <div className="relative mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-lg bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title || "Product image"}
            fill
            className="object-contain p-3"
            sizes="160px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="mt-4 flex min-w-0 flex-1 flex-col">
        <p className="font-heading text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
          {product.title}
        </p>
        {product.description ? (
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-gray-600">
            {product.description}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-blue-600">
          View on Amazon
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </a>
  );
}
