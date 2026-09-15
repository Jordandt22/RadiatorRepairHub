import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function formatPostDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function RelatedBlogsSection({ posts = [] }) {
  if (!Array.isArray(posts) || posts.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-10">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        Related Guides
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
        Helpful radiator and cooling system articles from RadiatorRepairHub.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {posts.map((post) => {
          const formattedDate = formatPostDate(post.metadata?.date);

          return (
            <li key={post.slug}>
              <Link
                href={`/blogs/${post.slug}`}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-interactive"
              >
                <h3 className="font-heading text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                  {post.metadata?.title || post.slug}
                </h3>
                {post.metadata?.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {post.metadata.description}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
                  <span>{formattedDate || "Guide"}</span>
                  <ArrowRight
                    className="size-4 shrink-0 transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/blogs"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        View all guides
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
