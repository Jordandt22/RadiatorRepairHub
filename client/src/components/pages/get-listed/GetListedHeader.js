import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function GetListedHeader() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Get Listed", url: "/get-listed" },
  ];

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle="List Your Business on RadiatorRepairHub"
      pageDescription="Reach more customers searching for radiator repair and auto cooling services in your city."
      headerLink={{
        href: "/how-to-claim",
        label: "Already listed? How to claim",
      }}
    />
  );
}

export default GetListedHeader;
