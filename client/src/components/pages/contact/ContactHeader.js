import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function ContactHeader() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ];

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle="Contact RadiatorRepairHub"
      pageDescription="Directory support, listing issues, partnerships, and website feedback. To reach a claimed repair shop, use Quick Contact on that business's page."
      headerLink={{
        href: "/search",
        label: "Search for a shop",
      }}
    />
  );
}

export default ContactHeader;
