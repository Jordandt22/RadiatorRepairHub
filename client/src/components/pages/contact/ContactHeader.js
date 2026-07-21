import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function ContactHeader() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ];

  const pageTitle = "Contact RadiatorRepairHub";
  const pageDescription =
    "Questions about our directory, a listing, partnerships, or the website? Message the RadiatorRepairHub team here. To reach a repair shop, use Quick Contact on that business's page.";

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default ContactHeader;
