import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function Header({ stateData, cityData, categoryData }) {
  if (categoryData) {
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
        pageTitle={`${categoryData.name} Businesses`}
        pageDescription={`Find trusted ${categoryData.name.toLowerCase()} specialists in your area. Compare services, read reviews, and get your vehicle running smoothly.`}
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

  const pageTitle = `Radiator Repair Services in ${
    cityData ? cityData.name : stateData.name
  }`;
  const pageDescription = `Find trusted radiator repair specialists in ${
    cityData ? cityData.name : stateData.name
  }. Compare services, read reviews, and get your vehicle running smoothly.`;

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
      pageDescription={pageDescription}
      headerLink={headerLink}
    />
  );
}

export default Header;
