import React from "react";

function ListingsSkeleton() {
  const skeletonCards = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skeletonCards.map((index) => (
          <div key={index} className="group relative h-[400px]">
            {/* Skeleton Card Container */}
            <div className="relative w-full h-full">
              {/* Skeleton Card */}
              <div className="bg-card rounded-lg border border-border overflow-hidden h-full animate-pulse">
                {/* Image skeleton */}
                <div className="relative w-full h-56 bg-muted">
                  <div className="absolute inset-0 w-full h-full bg-border/60 animate-pulse"></div>

                  {/* Category badge skeleton */}
                  <div className="absolute bottom-3 left-3">
                    <div className="h-6 w-20 bg-border rounded-md animate-pulse"></div>
                  </div>
                </div>

                {/* Content skeleton */}
                <div className="p-5">
                  {/* Title skeleton */}
                  <div className="mb-3">
                    <div className="h-6 bg-border rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-border rounded animate-pulse w-3/4"></div>
                  </div>

                  {/* Address skeleton */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-border rounded animate-pulse"
                        ></div>
                      ))}
                    </div>
                    <div className="ml-2 h-4 w-8 bg-border rounded animate-pulse"></div>
                    <div className="ml-1 h-4 w-12 bg-border rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListingsSkeleton;
