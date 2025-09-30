import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";

export const metadata = {
  title: "About RadiatorRepairHub | Your Trusted Radiator Repair Directory",
  description:
    "Learn about RadiatorRepairHub, your trusted directory for finding reliable radiator repair shops across the U.S. We connect drivers with verified cooling system experts.",
  keywords:
    "about radiator repair hub, radiator repair directory, cooling system experts, auto repair directory, radiator specialists",
  openGraph: {
    title: "About RadiatorRepairHub | Your Trusted Radiator Repair Directory",
    description:
      "Learn about RadiatorRepairHub, your trusted directory for finding reliable radiator repair shops across the U.S. We connect drivers with verified cooling system experts.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
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
  const bulletPointContent = [
    {
      title: "How We Make It Simple",
      bulletPoints: [
        {
          label: "Smart Local Search:",
          description:
            "Enter your location and instantly see radiator specialists in your area, organized by proximity and relevance.",
        },
        {
          label: "Verified Expertise: ",
          description:
            "Every listed business has been confirmed to offer genuine radiator repair services, not just general automotive work.",
        },
        {
          label: "Real Customer Insights: ",
          description:
            "Browse authentic reviews and ratings from drivers who've actually used these services for radiator repairs.",
        },
        {
          label: "Complete Business Profiles: ",
          description:
            "Get everything you need at a glance — location, phone numbers, addresses, hours of operation, services offered, etc.",
        },

        {
          label: "Filter Your Way: ",
          description:
            "Narrow your search by location, customer ratings, operating hours, services, etc.",
        },
      ],
    },
    {
      title: "Our Commitment to Drivers",
      bulletPoints: [
        {
          label: "Accuracy First: ",
          description:
            "We continuously verify and update every listing to ensure you're never calling a disconnected number or driving to a closed shop.",
        },
        {
          label: "Transparency Always: ",
          description:
            "We continuously verify and update every listing to ensure you're never calling a disconnected number or driving to a closed shop.",
        },
        {
          label: "Community-Driven: ",
          description:
            "Real reviews from real customers help you make informed decisions about where to trust your vehicle.",
        },
        {
          label: "Always Improving: ",
          description:
            "We actively seek feedback from both drivers and shop owners to enhance the platform and add new features that matter to our community.",
        },
      ],
    },
  ];

  const links = [
    {
      label: "Ready to find your local radiator expert? Start your search now",
      href: "/search",
    },
    {
      label: "Own a radiator repair business? Learn about getting listed",
      href: "/get-listed",
    },
    {
      label:
        "Have suggestions or feedback? Contact our team — we read every message and genuinely appreciate your input.",
      href: "/contact",
    },
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ];

  const pageTitle = "About RadiatorRepairHub";
  const pageDescription =
    "Your trusted directory for finding reliable radiator repair shops across the U.S.";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
      />

      {/* Content Sections */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
            Your Engine&apos;s Lifeline Deserves Expert Care
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            When your temperature gauge starts climbing or steam begins
            billowing from under your hood, every minute counts.
            RadiatorRepairHub connects you with skilled radiator specialists who
            understand the urgency of cooling system problems and have the
            expertise to get you back on the road safely.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
            The Problem We Solved
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            We&apos;ve all been there — frantically searching online for a
            radiator repair shop while your car sits disabled, only to find
            outdated phone numbers, closed businesses, or shops that don&apos;t
            actually specialize in cooling systems. Generic auto repair
            directories are cluttered with irrelevant results, and it&apos;s
            nearly impossible to tell which shops have real radiator expertise
            versus those who just claim they do.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            RadiatorRepairHub was born from this frustration. We recognized that
            radiator problems require specialized knowledge, and drivers deserve
            a dedicated resource that connects them specifically with cooling
            system experts.
          </p>
        </section>

        {bulletPointContent.map((item, index) => (
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
                    "about-page-bullet-point-" + index + "-" + bulletPoint.label
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

        {/* Get In Touch */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
            Join Our Growing Network
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Whether you&apos;re a driver who&apos;s found value in our directory
            or a radiator repair professional looking to connect with more
            customers, we want to hear from you. Your feedback helps us build a
            better resource for everyone who depends on reliable cooling system
            repairs.
          </p>
          {links.map((link) => (
            <Link
              href={link.href}
              key={"about-page-link-" + link.label}
              className="inline-block mb-4 text-gray-500 hover:text-blue-500 hover:underline duration-200"
            >
              • {link.label}
            </Link>
          ))}
        </section>

        <p className="text-lg text-blue-500 leading-relaxed italic text-center font-heading mb-8">
          RadiatorRepairHub: Where overheated drivers meet cooling system
          experts.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
