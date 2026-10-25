import { CHROME } from "@/lib/chrome";
import { getConfig, homeGallery, showGallery } from "@/lib/config";
import { eyebrow, h2, section, wrap } from "@/lib/ui";
import { GalleryPhotos } from "@/components/pages/shared/GalleryPhotos";

export function GalleryGrid() {
  const config = getConfig();
  if (!showGallery(config)) return null;
  const images = homeGallery(config);

  return (
    <section className={`${section} border-y border-line bg-sunken`} id="gallery">
      <div className={wrap}>
        <p className={eyebrow}>{CHROME.eyebrow.gallery}</p>
        <h2 className={h2}>{CHROME.heading.gallery}</h2>
        <GalleryPhotos images={images} />
      </div>
    </section>
  );
}
