"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { CHROME } from "@/lib/chrome";
import { grid3 } from "@/lib/ui";
import { StaggerChildren } from "@/components/motion/StaggerChildren";
import { PopupDialog } from "@/components/pages/shared/PopupDialog";

function Lightbox({ image, onClose }) {
  const titleId = useId();

  return (
    <PopupDialog labelledBy={titleId} closeLabel={CHROME.closePhoto} onClose={onClose}>
      <figure className="m-0 w-[min(92vw,72rem)]">
        <div className="relative h-[min(82dvh,52rem)] w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1152px) 72rem, 92vw"
            className="object-contain"
          />
        </div>
        <figcaption id={titleId} className="mt-3 text-center text-sm text-ink">
          {image.alt}
        </figcaption>
      </figure>
    </PopupDialog>
  );
}

export function GalleryPhotos({ images }) {
  const [active, setActive] = useState(null);
  const close = () => setActive(null);

  return (
    <>
      <StaggerChildren className={`${grid3} mt-6`}>
        {images.map((img, index) => (
          <figure className="m-0" key={img.src}>
            <button
              type="button"
              className="group relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left transition-all duration-300 hover:z-10 hover:shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_22px_rgba(255,255,255,0.14)]"
              aria-label={`${CHROME.viewLarger}: ${img.alt}`}
              onClick={() => setActive(index)}
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-card border border-line">
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25rem, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                />
              </div>
            </button>
          </figure>
        ))}
      </StaggerChildren>
      {active != null ? <Lightbox image={images[active]} onClose={close} /> : null}
    </>
  );
}
