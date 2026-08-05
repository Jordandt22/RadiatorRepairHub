"use client";

import Link from "next/link";
import BusinessImage from "@/components/businesses/BusinessImage";

function formatLastEdited(value) {
  if (!value) return "Not edited yet";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Not edited yet";
  }
}

export default function OwnedBusinessCard({ business }) {
  return (
    <Link
      href={`/business/${business.slug}`}
      className="block h-full"
      prefetch={false}
      aria-label={`View ${business.title}`}
    >
      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-lg">
        <div className="relative h-56 w-full bg-gray-200">
          <BusinessImage
            src={business.image_url}
            placeId={business.place_id}
            businessId={business.id}
            imageId={business.primary_image_id}
            cdnStored={Boolean(business.cdn_stored)}
            alt={business.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            showIcon={false}
          />
        </div>

        <div className="p-5">
          <h3 className="mb-1 line-clamp-2 font-heading text-lg font-semibold text-gray-900 hover:text-blue-600 duration-200">
            {business.title}
          </h3>
          {business.address ? (
            <p className="mb-1 text-sm text-gray-600">{business.address}</p>
          ) : (
            <p className="mb-1 text-sm text-gray-400">No address listed</p>
          )}
          <p className="text-sm text-gray-500">
            Last edited: {formatLastEdited(business.last_edited_at)}
          </p>
        </div>
      </article>
    </Link>
  );
}
