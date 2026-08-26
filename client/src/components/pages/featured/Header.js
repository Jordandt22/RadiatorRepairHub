import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function Header() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Featured", url: "/featured" },
  ];

  const pageTitle = "Featured Businesses";
  const pageDescription =
    "Paid Featured partners on RadiatorRepairHub. These shops are sponsored for extra visibility in search and on this page.";

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      headerLink={{
        label: "Search",
        href: "/search?page=1&sort=featured",
      }}
    />
  );
}

export default Header;
