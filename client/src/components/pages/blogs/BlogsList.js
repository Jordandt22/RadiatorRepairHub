"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import {
  BLOG_AUTHOR_AVATAR,
  BLOG_COVER_IMAGE,
} from "@/components/blogs/blogConstants";

function formatPostDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
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
        className={`${avatarClass} rounded-full border border-gray-200 bg-white object-contain`}
      />
      <div className="min-w-0 text-left">
        <p
          className={
            size === "md"
              ? "text-sm font-semibold text-gray-900"
              : "text-xs font-semibold text-gray-900"
          }
        >
          {author || "RadiatorRepairHub"}
        </p>
        {dateLabel ? (
          <p
            className={
              size === "md" ? "text-sm text-gray-500" : "text-xs text-gray-500"
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
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video w-full max-h-56 overflow-hidden bg-slate-900 md:max-h-64">
        <Image
          src={BLOG_COVER_IMAGE}
          alt={post.metadata.title || "Blog cover"}
          fill
          priority
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>
      <div className="space-y-4 p-6 md:p-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-blue-600 md:text-3xl">
          {post.metadata.title}
        </h2>
        {post.metadata.description ? (
          <p className="text-base leading-relaxed text-gray-600 md:text-lg">
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
      className="group block border-b border-gray-200 py-6 last:border-b-0"
    >
      <h3 className="font-heading text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 md:text-xl">
        {post.metadata.title}
      </h3>
      {post.metadata.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600 md:text-base">
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
  const query = searchTerm.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredPosts = useMemo(() => {
    if (!isSearching) return posts;

    return posts.filter((post) => {
      const title = post.metadata.title?.toLowerCase() ?? "";
      const description = post.metadata.description?.toLowerCase() ?? "";
      return title.includes(query) || description.includes(query);
    });
  }, [posts, query, isSearching]);

  const featuredPost = !isSearching && posts.length > 0 ? posts[0] : null;
  const listPosts = isSearching
    ? filteredPosts
    : posts.slice(featuredPost ? 1 : 0);

  if (posts.length === 0) {
    return <p className="text-lg text-gray-600">No blog posts yet.</p>;
  }

  return (
    <div className="space-y-10">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm leading-5 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Search articles"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 transition-colors hover:text-red-400" />
          </button>
        ) : null}
      </div>

      {featuredPost ? (
        <section aria-label="Featured post">
          <FeaturedPost post={featuredPost} />
        </section>
      ) : null}

      {isSearching && filteredPosts.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 font-heading text-xl font-bold text-gray-900">
            No Posts Found
          </h2>
          <p className="text-gray-600">
            No articles match your search. Try a different term.
          </p>
        </div>
      ) : listPosts.length > 0 ? (
        <section aria-label={isSearching ? "Search results" : "More posts"}>
          <h2 className="mb-2 font-heading text-xl font-bold text-gray-900 md:text-2xl">
            {isSearching ? "Search Results" : "More Posts"}
          </h2>
          <div className="divide-y-0 border-t border-gray-200">
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
