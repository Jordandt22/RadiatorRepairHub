"use client";

import { useEffect, useState } from "react";

function isRemoteHeroSrc(src) {
  if (!src || typeof src !== "string") return false;
  return !src.includes("/images/");
}

export default function BusinessHeroBanner({
  heroImage = null,
  alt,
  top = null,
  children,
}) {
  const [source, setSource] = useState(() =>
    heroImage?.src ? "primary" : "none"
  );

  useEffect(() => {
    setSource(heroImage?.src ? "primary" : "none");
  }, [heroImage?.src, heroImage?.srcSet, heroImage?.fallbackSrc]);

  const primarySrc = heroImage?.src ?? null;
  const fallbackSrc = heroImage?.fallbackSrc ?? null;
  const resolvedSrc =
    source === "fallback" ? fallbackSrc : source === "primary" ? primarySrc : null;
  const hasImage = Boolean(resolvedSrc);
  const useSrcSet = source === "primary" && Boolean(heroImage?.srcSet);

  const handleError = () => {
    if (source === "primary" && fallbackSrc) {
      setSource("fallback");
      return;
    }
    setSource("none");
  };

  return (
    <div
      className={`relative isolate flex min-h-[42svh] w-full flex-col overflow-hidden sm:min-h-[46svh] md:min-h-[50svh] ${
        hasImage ? "" : "section-signature"
      }`}
    >
      {hasImage ? (
        <>
          {/* Native img for responsive Cloudflare srcset without Next optimizer delay. */}
          <img
            src={resolvedSrc}
            srcSet={useSrcSet ? heroImage.srcSet : undefined}
            sizes={heroImage?.sizes}
            alt={alt}
            fetchPriority="high"
            decoding="async"
            referrerPolicy={
              isRemoteHeroSrc(resolvedSrc) ? "no-referrer" : undefined
            }
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={handleError}
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
