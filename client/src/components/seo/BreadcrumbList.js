import React from "react";
import Link from "next/link";
import JsonLd from "./JsonLd";

const BreadcrumbList = ({ items, navStyles }) => {
  // Helper function to convert relative URLs to absolute URLs
  const getAbsoluteUrl = (url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://radiatorrepairhub.com${url}`;
  };

  // Generate BreadcrumbList structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  };

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <JsonLd data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav className={`flex mb-6 ${navStyles}`} aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {items.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg
                  className="w-3 h-3 text-gray-500 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}

              {index === 0 ? (
                // Home icon for first item
                <Link
                  href={item.url}
                  className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-blue-400 capitalize"
                >
                  <svg
                    className="w-3 h-3 mr-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                  {item.name}
                </Link>
              ) : index === items.length - 1 ? (
                // Current page (last item)
                <span className="ml-1 text-sm font-medium text-gray-400 md:ml-2 capitalize">
                  {item.name}
                </span>
              ) : (
                // Middle items (clickable)
                <Link
                  href={item.url}
                  className="group/link inline-flex items-center text-sm font-medium hover:text-blue-400"
                >
                  <span className="ml-1 text-sm font-medium text-gray-300 md:ml-2 group-hover/link:text-blue-400 capitalize">
                    {item.name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default BreadcrumbList;
