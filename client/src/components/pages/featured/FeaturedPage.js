"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import FeaturedGrid from "./FeaturedGrid";
import {
  FEATURED_DEFAULT_SORT,
  buildFeaturedHref,
} from "./featuredUrl";

function FeaturedPage({
  businesses = [],
  total = 0,
  page = 1,
  totalPages = 0,
  sort = FEATURED_DEFAULT_SORT,
  q = "",
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextQuery = searchTerm.trim();
      if (nextQuery === q) return;
      router.replace(
        buildFeaturedHref({ page: 1, sort, q: nextQuery }),
        { scroll: false }
      );
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, q, sort, router]);

  const handleSortChange = (nextSort) => {
    if (nextSort === sort) return;
    router.push(buildFeaturedHref({ page: 1, sort: nextSort, q: searchTerm.trim() }));
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <FeaturedGrid
        businesses={businesses}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sort={sort}
        onSortChange={handleSortChange}
        totalBusinesses={total}
        currentPage={page}
        totalPages={totalPages}
        showPlaceholders={!q && page === 1}
      />
    </div>
  );
}

export default FeaturedPage;
