import Image from "next/image";
import { CHROME } from "@/lib/chrome";
import { getConfig, homeGallery, showGallery } from "@/lib/config";
import { eyebrow, grid3, h2, section, wrap } from "@/lib/ui";
import { StaggerChildren } from "@/components/motion/StaggerChildren";

export function GalleryGrid() {
  const config = getConfig();
  if (!showGallery(config)) return null;
  const images = homeGallery(config);

  return (
    <section className={`${section} border-y border-line bg-sunken`} id="gallery">
      <div className={wrap}>
        <p className={eyebrow}>{CHROME.eyebrow.gallery}</p>
        <h2 className={h2}>{CHROME.heading.gallery}</h2>
        <StaggerChildren className={`${grid3} mt-6`}>
          {images.map((img) => (
            <figure
              className="relative m-0 aspect-4/3 overflow-hidden rounded-card border border-line"
              key={img.src}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 25rem, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </figure>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
