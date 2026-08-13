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
        className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-interactive/50"
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title || "Product image"}
              fill
              className="object-contain p-2"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-bold text-foreground transition-colors group-hover:text-interactive md:text-lg">
            {product.title}
          </p>
          {product.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          ) : null}
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-interactive">
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
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-interactive/50"
    >
      <div className="relative mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-lg bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title || "Product image"}
            fill
            className="object-contain p-3"
            sizes="160px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="mt-4 flex min-w-0 flex-1 flex-col">
        <p className="font-heading text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-interactive">
          {product.title}
        </p>
        {product.description ? (
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-interactive">
          View on Amazon
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </a>
  );
}
