"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import {
  bypassImageOptimizer,
  buildCfImageUrl,
  CF_IMAGE_VARIANT,
  getBusinessImageId,
  usableImageSrc,
} from "@/lib/images";

export const BUSINESS_COVER_PLACEHOLDER =
  "/assets/images/business-cover-placeholder.svg";

function BusinessImage({
  src,
  businessId,
  imageId,
  cdnStored = false,
  alt,
  fill = true,
  sizes,
  className = "object-cover",
  priority = false,
  showIcon = true,
  iconSize = "md",
  // "placeholder" = branded SVG; "message" = No image available UI; "solid" = blank bg
  fallback = "placeholder",
  fallbackClassName = "bg-muted",
  variant = CF_IMAGE_VARIANT.card,
}) {
  const cfImageId = getBusinessImageId({
    businessId,
    imageId,
    cdnStored,
  });
  const cdnSrc = usableImageSrc(buildCfImageUrl(cfImageId, variant));
  const remoteSrc = usableImageSrc(src);
  const canUseCdn = Boolean(cdnSrc);
  const hasRemote = Boolean(remoteSrc);

  // Prefer Cloudflare when available; otherwise start on remote image_url
  const [source, setSource] = useState(() =>
    canUseCdn ? "cdn" : hasRemote ? "remote" : "none"
  );

  React.useEffect(() => {
    setSource(canUseCdn ? "cdn" : hasRemote ? "remote" : "none");
  }, [canUseCdn, hasRemote, cdnSrc, remoteSrc]);

  const resolvedSrc =
    source === "cdn" ? cdnSrc : source === "remote" ? remoteSrc : null;

  if (!resolvedSrc) {
    if (fallback === "solid") {
      return (
        <div
          className={`absolute inset-0 w-full h-full ${fallbackClassName}`}
          aria-hidden="true"
        />
      );
    }

    if (fallback === "placeholder") {
      return (
        <Image
          src={BUSINESS_COVER_PLACEHOLDER}
          alt=""
          fill={fill}
          sizes={sizes}
          className={className}
          priority={priority}
          unoptimized
          aria-hidden="true"
        />
      );
    }

    const iconClass =
      iconSize === "lg"
        ? "w-16 h-16 md:w-20 md:h-20"
        : iconSize === "sm"
          ? "w-12 h-12"
          : "w-16 h-16";
    const alertClass =
      iconSize === "lg"
        ? "w-8 h-8 md:w-10 md:h-10"
        : iconSize === "sm"
          ? "w-6 h-6"
          : "w-8 h-8";
    const textClass =
      iconSize === "lg" ? "text-sm md:text-lg" : "text-sm";

    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
        <div className="text-center">
          {showIcon && (
            <div
              className={`${iconClass} bg-muted rounded-full flex items-center justify-center mx-auto mb-2`}
            >
              <CircleAlert className={`${alertClass} text-muted-foreground`} />
            </div>
          )}
          <p className={`text-muted-foreground ${textClass}`}>No image available</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={source === "cdn" || bypassImageOptimizer}
      referrerPolicy={source === "remote" ? "no-referrer" : undefined}
      onError={() =>
        setSource(
          source === "cdn" && hasRemote
            ? "remote"
            : "none"
        )
      }
    />
  );
}

export default BusinessImage;
