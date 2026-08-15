import { Badge } from "@/components/ui/badge";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function CdnStoredBadge({ stored }) {
  if (stored) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-emerald-100 text-emerald-800"
      >
        Stored
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-transparent bg-zinc-100 text-zinc-700"
    >
      Not stored
    </Badge>
  );
}

function sortImages(images) {
  return [...images].sort((a, b) => {
    if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
      return a.is_primary ? -1 : 1;
    }
    return String(a.image_id).localeCompare(String(b.image_id));
  });
}

export default function BusinessDetailImagesTab({ data }) {
  const images = Array.isArray(data.business_images)
    ? sortImages(data.business_images)
    : [];
  const cdnStored = Boolean(data.cdn_stored);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">CDN status</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BusinessDetailCard label="CDN stored">
            <CdnStoredBadge stored={cdnStored} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Upload attempts">
            {data.cdn_stored_attempts ?? 0}
          </BusinessDetailCard>
          <BusinessDetailCard label="Image records">
            {images.length}
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Source image</h2>
        {data.image_url ? (
          <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.image_url}
              alt={data.title ? `${data.title} listing photo` : "Listing photo"}
              className="max-h-80 w-full object-contain bg-background"
            />
            <div className="border-t border-border p-3">
              <a
                href={data.image_url}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm underline underline-offset-2"
              >
                {data.image_url}
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No source image URL.</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">CDN images</h2>
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Cloudflare image records for this listing.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <li
                key={image.image_id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Image ID</span>
                  {image.is_primary ? (
                    <Badge
                      variant="outline"
                      className="border-transparent bg-sky-100 text-sky-800"
                    >
                      Primary
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 break-all font-mono text-xs">
                  {image.image_id}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Added {formatFullDate(image.created_at)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cdnStored
                    ? "Available on CDN"
                    : "Recorded, not marked CDN stored"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
