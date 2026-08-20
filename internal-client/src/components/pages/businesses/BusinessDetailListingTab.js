import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import BusinessReviewsBadge from "@/components/pages/businesses/BusinessReviewsBadge";
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

export default function BusinessDetailListingTab({
  data,
  onEdit,
  onEditCategories,
}) {
  const isClaimed = Boolean(data.is_claimed);
  const hasOwner = Boolean(data.owner_uid);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Listing</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={onEdit}
          >
            <PencilIcon />
            Edit
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BusinessDetailCard label="Title">{data.title || "—"}</BusinessDetailCard>
          <BusinessDetailCard label="Slug">{data.slug || "—"}</BusinessDetailCard>
          <BusinessDetailCard label="Phone">{data.phone || "—"}</BusinessDetailCard>
          <BusinessDetailCard label="Website">
            {data.website ? (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline underline-offset-2"
              >
                {data.website}
              </a>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <BusinessDetailCard label="Score">
            <BusinessScoreBadge score={data.total_score} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Reviews">
            <BusinessReviewsBadge count={data.reviews_count} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Claimed">
            <BusinessClaimedBadge isClaimed={isClaimed} />
          </BusinessDetailCard>
          <BusinessDetailCard label="Last edited">
            {formatFullDate(data.last_edited_at)}
          </BusinessDetailCard>
          <BusinessDetailCard label="Created">
            {formatFullDate(data.created_at)}
          </BusinessDetailCard>
          <BusinessDetailCard label="Place ID">
            {data.place_id ? (
              <span className="break-all font-mono text-xs">{data.place_id}</span>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <BusinessDetailCard label="Business ID">
            <span className="break-all font-mono text-xs">{data.id}</span>
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Content & SEO</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={onEdit}
          >
            <PencilIcon />
            Edit
          </Button>
        </div>
        <dl className="grid gap-3">
          <BusinessDetailCard label="About description">
            {data.description ? (
              <p className="whitespace-pre-wrap leading-relaxed">
                {data.description}
              </p>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <div className="grid gap-3 sm:grid-cols-2">
            <BusinessDetailCard label="Title tag">
              {data.title_tag || "—"}
            </BusinessDetailCard>
            <BusinessDetailCard label="Local note">
              {data.local_note ? (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {data.local_note}
                </p>
              ) : (
                "—"
              )}
            </BusinessDetailCard>
          </div>
          <BusinessDetailCard label="Meta description">
            {data.meta_description ? (
              <p className="whitespace-pre-wrap leading-relaxed">
                {data.meta_description}
              </p>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <BusinessDetailCard label="Keywords">
            {Array.isArray(data.keywords) && data.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Categories</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={onEditCategories}
          >
            <PencilIcon />
            Edit
          </Button>
        </div>
        <dl className="grid gap-3">
          <BusinessDetailCard label="Primary category">
            {data.primary_category?.name ? (
              <span className="inline-flex rounded-full border border-transparent bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                {data.primary_category.name}
              </span>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
          <BusinessDetailCard label="Secondary categories">
            {Array.isArray(data.secondary_categories) &&
            data.secondary_categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.secondary_categories.map((category) => (
                  <span
                    key={category.id ?? category.name}
                    className="rounded-full border border-transparent bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            ) : (
              "—"
            )}
          </BusinessDetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Owner</h2>
        {isClaimed && hasOwner ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <BusinessDetailCard label="Owner email">
              {data.owner_email ? (
                <Link
                  href={`/users/${data.owner_uid}`}
                  className="break-all underline underline-offset-2"
                >
                  {data.owner_email}
                </Link>
              ) : (
                <Link
                  href={`/users/${data.owner_uid}`}
                  className="underline underline-offset-2"
                >
                  View owner
                </Link>
              )}
            </BusinessDetailCard>
            <BusinessDetailCard label="Owner UID">
              <Link
                href={`/users/${data.owner_uid}`}
                className="break-all font-mono text-xs underline underline-offset-2"
              >
                {data.owner_uid}
              </Link>
            </BusinessDetailCard>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            This listing is not claimed.
          </p>
        )}
      </section>
    </div>
  );
}
