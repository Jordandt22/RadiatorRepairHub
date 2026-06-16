"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

function BlogsList({ posts }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) =>
      post.metadata.title.toLowerCase().includes(query)
    );
  }, [posts, searchTerm]);

  if (posts.length === 0) {
    return <p className="text-lg text-gray-600">No blog posts yet.</p>;
  }

  return (
    <>
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blog titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 text-sm"
            aria-label="Search blog titles"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-red-400 duration-200" />
            </button>
          )}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-heading">
            No posts found
          </h2>
          <p className="text-gray-600">
            No blog titles match your search. Try a different term.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-2">
                {post.metadata.date
                  ? new Date(post.metadata.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null}
                {post.metadata.author ? ` · ${post.metadata.author}` : null}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 font-heading">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.metadata.title}
                </Link>
              </h2>
              {post.metadata.description ? (
                <p className="text-gray-700 leading-relaxed mb-4">
                  {post.metadata.description}
                </p>
              ) : null}
              <Link
                href={`/blogs/${post.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default BlogsList;
