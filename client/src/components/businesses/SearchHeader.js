import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function SearchHeader({ title }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Search", url: "/search" },
  ];

  const pageTitle = !title
    ? "Search for Radiator Repair Services"
    : `Radiator Repair Services for "${title}"`;

  const pageDescription = `Find trusted radiator repair specialists${
    title ? ` for "${title}"` : ""
  }. Compare services, read reviews, and get your vehicle running smoothly.`;

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default SearchHeader;
