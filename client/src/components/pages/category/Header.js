import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function Header({ categoryName, categorySlug }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    { name: categoryName, url: `/category/${categorySlug}` },
  ];

  const pageTitle = `${categoryName} Businesses`;
  const pageDescription = `Find trusted ${categoryName} specialists in your area. Compare services, read reviews, and get your vehicle running smoothly.`;

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default Header;
