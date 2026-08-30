import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function PricingHeader() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Featured Pricing", url: "/pricing" },
  ];

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle="Featured Listings"
      pageDescription="Stand out when drivers search for radiator repairs and increase your leads. Featured shops get a badge, higher placement, and a spot on our Featured page."
      headerLink={{
        href: "/how-to-claim",
        label: "Need to claim first?",
      }}
    />
  );
}

export default PricingHeader;
