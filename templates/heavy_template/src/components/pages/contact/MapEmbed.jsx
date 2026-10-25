import { getConfig } from "@/lib/config";
import { mapsEmbedSrc } from "@/lib/maps";

export function MapEmbed({ className = "" }) {
  const config = getConfig();
  const src = mapsEmbedSrc(config);
  if (!src) return null;

  const { shop } = config;

  return (
    <div
      className={[
        "overflow-hidden rounded-card border border-line",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <iframe
        title={`Map showing ${shop.name}`}
        src={src}
        className="aspect-[4/3] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
