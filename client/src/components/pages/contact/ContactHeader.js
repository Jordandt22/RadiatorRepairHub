import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";

function ContactHeader() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ];

  const pageTitle = "Contact Us";
  const pageDescription =
    "Have a question about radiator repair services? Need help finding a repair shop? We're here to help connect you with trusted professionals in your area.";

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  );
}

export default ContactHeader;
