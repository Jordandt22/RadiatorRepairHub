"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  buildCfImageUrl,
  BUSINESS_HERO_IMAGE_SIZES,
  CF_IMAGE_VARIANT,
  getBusinessImageId,
  usableImageSrc,
} from "@/lib/images";

export default function BusinessHeroBanner({
  src,
  businessId,
  imageId,
  cdnStored = false,
  alt,
  top = null,
  children,
  sizes = BUSINESS_HERO_IMAGE_SIZES,
}) {
  const cfImageId = getBusinessImageId({
    businessId,
    imageId,
    cdnStored,
  });
  const cdnSrc = usableImageSrc(
    buildCfImageUrl(cfImageId, CF_IMAGE_VARIANT.hero)
  );
  const remoteSrc = usableImageSrc(src);
  const canUseCdn = Boolean(cdnSrc);
  const hasRemote = Boolean(remoteSrc);

  const [source, setSource] = useState(() =>
    canUseCdn ? "cdn" : hasRemote ? "remote" : "none"
  );

  React.useEffect(() => {
    setSource(canUseCdn ? "cdn" : hasRemote ? "remote" : "none");
  }, [canUseCdn, hasRemote, cdnSrc, remoteSrc]);

  const resolvedSrc =
    source === "cdn" ? cdnSrc : source === "remote" ? remoteSrc : null;
  const hasImage = Boolean(resolvedSrc);

  return (
    <div
      className={`relative isolate flex min-h-[42svh] w-full flex-col overflow-hidden sm:min-h-[46svh] md:min-h-[50svh] ${
        hasImage ? "" : "section-signature"
      }`}
    >
      {hasImage ? (
        <>
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover object-center"
            priority
            unoptimized
            referrerPolicy={source === "remote" ? "no-referrer" : undefined}
            onError={() =>
              setSource(source === "cdn" && hasRemote ? "remote" : "none")
            }
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="relative z-[1] flex min-h-[42svh] w-full flex-1 flex-col justify-between sm:min-h-[46svh] md:min-h-[50svh]">
        {top ? <div className="w-full">{top}</div> : null}
        <div className="mt-auto w-full">{children}</div>
      </div>
    </div>
  );
}
