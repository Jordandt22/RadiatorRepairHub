import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";
import { toTitleCase } from "@/lib/seo/metadata";

function Header({ stateData, cityData, categoryData, pageDescription }) {
  if (categoryData) {
    const categoryDescription =
      pageDescription ??
      `Find a trusted ${categoryData.name.toLowerCase()} in your area. Compare ratings and reviews, check hours, and contact shops directly.`;

    return (
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Categories", url: "/categories" },
          {
            name: categoryData.name,
            url: `/category/${categoryData.slug}`,
          },
        ]}
        pageTitle={`${toTitleCase(categoryData.name)} Near You`}
        pageDescription={categoryDescription}
        headerLink={{
          label: "View Categories",
          href: "/categories",
        }}
      />
    );
  }

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: stateData.name, url: `/state/${stateData.code}` },
  ];

  if (cityData) {
    breadcrumbItems.push({
      name: cityData.name,
      url: `/state/${stateData.code}/city/${cityData.slug}`,
    });
  }

  const pageTitle = cityData
    ? `Radiator Repair in ${cityData.name}, ${stateData.code}`
    : `Radiator Repair in ${stateData.name}`;
  const locationDescription =
    pageDescription ??
    (cityData
      ? `Looking for radiator repair near you in ${cityData.name}? Compare local shops by rating and reviews, check hours, and call or get directions.`
      : `Find radiator repair near you anywhere in ${stateData.name}. Compare verified shops by city, rating, and reviews, then contact them directly.`);

  const headerLink = cityData
    ? {
        label: `Go to ${stateData.name}`,
        href: `/state/${stateData.code}`,
      }
    : {
        label: "View Cities",
        href: `/states/${stateData.code}/cities`,
      };

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={locationDescription}
      headerLink={headerLink}
    />
  );
}

export default Header;
