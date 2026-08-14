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
      pageDescription="Directory support, listing issues, partnerships, and website feedback. To reach a repair shop, use Quick Contact on that business's page."
      headerLink={{
        href: "/search?page=1&sort=most_reviews",
        label: "Search for a shop",
      }}
    />
  );
}

export default ContactHeader;
