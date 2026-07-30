import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";

export const metadata = {
  title: "About RadiatorRepairHub | Radiator Repair Directory",
  description:
    "Learn about RadiatorRepairHub, a directory for finding radiator repair shops across the U.S. Search by location, compare listings, and contact shops directly.",
  keywords:
    "about radiator repair hub, radiator repair directory, cooling system experts, auto repair directory, radiator specialists",
  openGraph: {
    title: "About RadiatorRepairHub | Radiator Repair Directory",
    description:
      "Learn about RadiatorRepairHub, a directory for finding radiator repair shops across the U.S. Search by location, compare listings, and contact shops directly.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    url: "https://radiatorrepairhub.com/about",
    images: [
      {
        url: "https://radiatorrepairhub.com/assets/logos/logo.png",
        width: 1200,
        height: 630,
        alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
      },
    ],
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/about",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

function AboutPage() {
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About RadiatorRepairHub",
    description:
      "Learn about RadiatorRepairHub, a directory for finding radiator repair shops across the U.S.",
    url: "https://radiatorrepairhub.com/about",
    mainEntity: {
      "@id": "https://radiatorrepairhub.com/#organization",
    },
  };

  const bulletPointContent = [
    {
      title: "What You Can Do",
      bulletPoints: [
        {
          label: "Search by location:",
          description:
            "Enter a city, state, or ZIP and browse shops near you.",
        },
        {
          label: "Filter results:",
          description:
            "Narrow by rating, review count, open hours, categories, and features. Sort by reviews or rating.",
        },
        {
          label: "Business profiles:",
          description:
            "See address, phone, hours, services, photos, and reviews on each listing.",
        },
        {
          label: "Quick Contact:",
          description:
            "Message a shop from its page, or call using the number listed there.",
        },
        {
          label: "Browse by area or category:",
          description:
            "Explore by state, city, or service category when you are not searching for a specific place.",
        },
      ],
    },
    {
      title: "How We Keep Listings Honest",
      bulletPoints: [
        {
          label: "Listing quality:",
          description:
            "We work to list genuine radiator repair businesses and keep the directory updated, including reviewing Get Listed submissions and Report Info tips.",
        },
        {
          label: "Claimed listings:",
          description:
            "A claimed listing means the owner verified access to the listing email and created an account. It does not replace calling ahead to confirm current services and hours.",
        },
        {
          label: "Report problems:",
          description:
            "Use Report Info on a business page if contact details are wrong or content looks off.",
        },
        {
          label: "Privacy:",
          description:
            "We are clear about how the directory works and how we handle visitor information. See our Privacy Policy for details.",
        },
      ],
    },
  ];

  const links = [
    {
      label: "Search the directory",
      href: "/search",
    },
    {
      label: "Radiator repair tips on the blog",
      href: "/blogs",
    },
    {
      label: "Get your shop listed",
      href: "/get-listed",
    },
    {
      label: "Claim an existing listing",
      href: "/how-to-claim",
    },
    {
      label: "Contact us",
      href: "/contact",
    },
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ];

  const pageTitle = "About RadiatorRepairHub";
  const pageDescription =
    "A directory for finding radiator repair shops across the U.S.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageSchema),
        }}
      />
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          pageTitle={pageTitle}
          pageDescription={pageDescription}
        />

        <div className="max-w-3xl mx-auto px-6 py-12">
          <section className="mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
              Find Radiator Repair Shops Near You
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              RadiatorRepairHub is a business directory focused on radiator and
              cooling system repair. Search by location, compare listings, and
              contact shops directly when you need help.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
              Why We Built It
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Generic auto repair directories mix in shops that barely touch
              radiators, and listings often go stale. We built a directory aimed
              at cooling system work so you can browse shops that actually do
              radiator repair, with filters and profiles that show services,
              hours, reviews, and contact details.
            </p>
          </section>

          {bulletPointContent.map((item) => (
            <section
              className="mb-12"
              key={"about-page-bullet-point-section-" + item.title}
            >
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8">
                {item.title}
              </h2>
              <div className="text-lg text-gray-700 leading-relaxed space-y-4">
                {item.bulletPoints.map((bulletPoint, index) => (
                  <p
                    key={
                      "about-page-bullet-point-" +
                      index +
                      "-" +
                      bulletPoint.label
                    }
                    className="mb-8 flex flex-col"
                  >
                    <strong className="mb-2">• {bulletPoint.label}</strong>{" "}
                    {bulletPoint.description}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
              For Drivers and Shop Owners
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Whether you are looking for a shop or managing a listing, your
              feedback helps us keep the directory useful.
            </p>
            {links.map((link) => (
              <Link
                href={link.href}
                key={"about-page-link-" + link.label}
                className="block mb-4 text-gray-500 hover:text-blue-500 hover:underline duration-200"
              >
                • {link.label}
              </Link>
            ))}
          </section>

          <DirectoryDisclaimer className="mb-16" />
        </div>
      </div>
    </>
  );
}

export default AboutPage;
