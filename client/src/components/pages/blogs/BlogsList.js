"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BLOG_AUTHOR_AVATAR,
  BLOG_COVER_IMAGE,
} from "@/components/blogs/blogConstants";
import BlogSearch from "./BlogSearch";
import BlogSort from "./BlogSort";

function formatPostDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getPostTimestamp(date) {
  const parsed = Date.parse(date ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortPosts(posts, sort) {
  return [...posts].sort((a, b) => {
    if (sort === "alpha") {
      return (a.metadata.title || "").localeCompare(b.metadata.title || "");
    }

    const diff =
      getPostTimestamp(b.metadata.date) - getPostTimestamp(a.metadata.date);
    if (diff !== 0) {
      return sort === "oldest" ? -diff : diff;
    }

    return (a.metadata.title || "").localeCompare(b.metadata.title || "");
  });
}

function AuthorMeta({ author, dateLabel, size = "sm" }) {
  const avatarSize = size === "md" ? 36 : 28;
  const avatarClass =
    size === "md" ? "h-9 w-9 p-0.5" : "h-7 w-7 p-0.5";

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src={BLOG_AUTHOR_AVATAR}
        alt={author || "RadiatorRepairHub"}
        width={avatarSize}
        height={avatarSize}
        className={`${avatarClass} rounded-full border border-border bg-card object-contain`}
      />
      <div className="min-w-0 text-left">
        <p
          className={
            size === "md"
              ? "text-sm font-semibold text-foreground"
              : "text-xs font-semibold text-foreground"
          }
        >
          {author || "RadiatorRepairHub"}
        </p>
        {dateLabel ? (
          <p
            className={
              size === "md"
                ? "text-sm text-muted-foreground"
                : "text-xs text-muted-foreground"
            }
          >
            {dateLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FeaturedPost({ post }) {
  const dateLabel = formatPostDate(post.metadata.date);

  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors duration-200 hover:border-interactive"
    >
      <div className="relative aspect-video w-full max-h-56 overflow-hidden bg-muted md:max-h-64">
        <Image
          src={BLOG_COVER_IMAGE}
          alt={post.metadata.title || "Blog cover"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>
      <div className="space-y-4 p-6 md:p-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
          {post.metadata.title}
        </h2>
        {post.metadata.description ? (
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {post.metadata.description}
          </p>
        ) : null}
        <AuthorMeta
          author={post.metadata.author}
          dateLabel={dateLabel}
          size="md"
        />
      </div>
    </Link>
  );
}

function PostRow({ post }) {
  const dateLabel = formatPostDate(post.metadata.date);

  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group block border-b border-border py-6 last:border-b-0"
    >
      <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary md:text-xl">
        {post.metadata.title}
      </h3>
      {post.metadata.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {post.metadata.description}
        </p>
      ) : null}
      <div className="mt-3">
        <AuthorMeta author={post.metadata.author} dateLabel={dateLabel} />
      </div>
    </Link>
  );
}

function BlogsList({ posts }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("newest");

  const query = searchTerm.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredPosts = useMemo(() => {
    const matched = isSearching
      ? posts.filter((post) => {
          const title = post.metadata.title?.toLowerCase() ?? "";
          const description = post.metadata.description?.toLowerCase() ?? "";
          return title.includes(query) || description.includes(query);
        })
      : [...posts];

    return sortPosts(matched, sort);
  }, [posts, query, isSearching, sort]);

  const featuredPost =
    !isSearching && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const listPosts = isSearching
    ? filteredPosts
    : filteredPosts.slice(featuredPost ? 1 : 0);

  if (posts.length === 0) {
    return (
      <p className="text-lg text-muted-foreground">No blog posts yet.</p>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-green-700">
          {filteredPosts.length.toLocaleString()}
        </span>{" "}
        {filteredPosts.length === 1 ? "Article" : "Articles"}
        {isSearching ? ` of ${posts.length.toLocaleString()}` : null}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <BlogSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <BlogSort sort={sort} onSortChange={setSort} />
      </div>

      {featuredPost ? (
        <section aria-label="Featured post">
          <FeaturedPost post={featuredPost} />
        </section>
      ) : null}

      {isSearching && filteredPosts.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 font-heading text-xl font-bold text-foreground">
            No Posts Found
          </h2>
          <p className="text-muted-foreground">
            No articles match your search. Try a different term.
          </p>
        </div>
      ) : listPosts.length > 0 ? (
        <section aria-label={isSearching ? "Search results" : "More posts"}>
          <h2 className="mb-2 font-heading text-xl font-semibold text-foreground md:text-2xl">
            {isSearching ? "Search Results" : "More Posts"}
          </h2>
          <div className="border-t border-border">
            {listPosts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default BlogsList;
