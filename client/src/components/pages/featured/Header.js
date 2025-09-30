import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function Header() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Featured", url: "/featured" },
  ];

  const pageTitle = "Featured Businesses";
  const pageDescription =
    "Discover our top-rated radiator repair specialists. These featured businesses have earned exceptional reviews and provide outstanding service to their communities.";

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default Header;
