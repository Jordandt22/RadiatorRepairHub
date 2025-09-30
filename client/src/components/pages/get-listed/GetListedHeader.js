import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function GetListedHeader() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Get Listed", url: "/get-listed" },
  ];

  const pageTitle = "List Your Business on RadiatorRepairHub";
  const pageDescription =
    "Reach more customers searching for radiator repair and auto cooling services in your city.";

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default GetListedHeader;
