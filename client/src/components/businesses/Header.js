import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function Header({ stateData, cityData }) {
  // Generate breadcrumb items
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

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default Header;
