import React from "react";

export const metadata = {
  title: "Privacy Policy | How We Protect Your Data - RadiatorRepairHub",
  description:
    "Learn how RadiatorRepairHub protects your privacy and handles your personal information. Our comprehensive privacy policy covers data collection, usage, and your rights.",
  keywords:
    "privacy policy, data protection, personal information, GDPR, CCPA, privacy rights, data security",
  openGraph: {
    title: "Privacy Policy | How We Protect Your Data - RadiatorRepairHub",
    description:
      "Learn how RadiatorRepairHub protects your privacy and handles your personal information. Our comprehensive privacy policy covers data collection, usage, and your rights.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | How We Protect Your Data - RadiatorRepairHub",
    description:
      "Learn how RadiatorRepairHub protects your privacy and handles your personal information. Our comprehensive privacy policy covers data collection, usage, and your rights.",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/privacy",
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

function PrivacyPage() {
  const effectiveDate = new Date("2025-09-22").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const lastUpdated = new Date("2025-09-22").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const informationCollectedContent = [
    {
      title: "Personal Information You Provide",
      bulletPoints: [
        {
          label: "Contact Information:",
          description:
            "Name, email address, phone number, and mailing address when you contact us through forms, email, or phone.",
        },
        {
          label: "Business Information:",
          description:
            "If you're a business owner requesting to be listed, we may collect business name, address, contact details, business description, hours of operation, and services offered.",
        },
        {
          label: "Communication Records:",
          description:
            "Content of messages, emails, or other communications you send to us.",
        },
        {
          label: "Feedback and Reviews:",
          description:
            "Any reviews, ratings, or feedback you choose to submit about listed businesses.",
        },
        {
          label: "Account Information:",
          description:
            "If we implement user accounts in the future, username, password, and profile information.",
        },
      ],
    },
    {
      title: "Information Automatically Collected",
      bulletPoints: [
        {
          label: "Usage Data:",
          description:
            "Pages visited, time spent on pages, search queries, click patterns, and navigation paths.",
        },
        {
          label: "Device Information:",
          description:
            "Public IP address, browser type and version, operating system, device type, screen resolution, and unique device identifiers. Public IP address is the IP address of the device you are using to access the website. It is not your private IP address.",
        },
        {
          label: "Location Data:",
          description:
            "General location information based on Public IP address (city/state level, not precise location).",
        },
        {
          label: "Referral Information:",
          description:
            "The website or search engine that referred you to our site.",
        },
        {
          label: "Session Information:",
          description:
            "Date and time of visits, session duration, and pages accessed during each session.",
        },
      ],
    },
    {
      title: "Cookies and Tracking Technologies",
      bulletPoints: [
        {
          label: "Essential Cookies:",
          description: "Necessary for basic website functionality.",
        },
        {
          label: "Analytics Cookies:",
          description:
            "Help us understand how visitors use our site (Google Analytics, etc.).",
        },
        {
          label: "Functional Cookies:",
          description: "To remember your preferences and settings.",
        },
        {
          label: "Performance Cookies:",
          description:
            "Collect information about website performance and user interactions.",
        },
      ],
    },
  ];

  const howWeUseYourInformationContent = [
    {
      title: "Primary Uses",
      bulletPoints: [
        {
          label: "Service Operation:",
          description: "Maintain and operate our directory service.",
        },
        {
          label: "Communication:",
          description: "Respond to inquiries, support requests, and feedback.",
        },
        {
          label: "Directory Management:",
          description: "Add, update, or remove business listings.",
        },
        {
          label: "User Experience:",
          description: "Improve website functionality and user interface.",
        },
        {
          label: "Search Functionality:",
          description:
            "Provide relevant search results based on location and preferences.",
        },
      ],
    },
    {
      title: "Analytics and Improvement",
      bulletPoints: [
        {
          label: "Website Analytics:",
          description:
            "Analyze usage patterns, popular searches, and user behavior.",
        },
        {
          label: "Performance Monitoring:",
          description: "Identify and fix technical issues.",
        },
        {
          label: "Content Optimization:",
          description: "Improve the relevance and usefulness of our directory.",
        },
        {
          label: "Feature Development:",
          description: "Develop new features based on user needs and behavior.",
        },
      ],
    },
    {
      title: "Legal and Security",
      bulletPoints: [
        {
          label: "Compliance:",
          description: "Meet legal obligations and regulatory requirements.",
        },
        {
          label: "Security:",
          description: "Protect against fraud, abuse, and security threats.",
        },
        {
          label: "Legal Proceedings:",
          description:
            "Respond to legal requests, court orders, or law enforcement.",
        },
      ],
    },
  ];

  const serviceProviderBulletPoints = [
    {
      label: "Web hosting and cloud storage",
    },
    {
      label: "Analytics and performance monitoring",
    },
    {
      label: "Email communication services",
    },
    {
      label: "Customer support platforms",
    },
    {
      label: "Security and fraud prevention",
    },
  ];

  const legalRequirementsBulletPoints = [
    { label: "Compliance with subpoenas, court orders, or legal processes" },
    { label: "Protection of our rights, property, or safety" },
    { label: "Protection of users' rights, property, or safety" },
    { label: "Investigation of fraud or security issues" },
    { label: "Enforcement of our terms of service" },
  ];

  const securityMeasuresBulletPoints = [
    {
      label: "Encryption:",
      description: "SSL/TLS encryption for data transmission.",
    },
    {
      label: "Access Controls:",
      description:
        "Access controls are used to restrict access to your personal information to only those who need to know it to perform their job functions.",
    },
    {
      label: "Regular Updates:",
      description: "Keep security software and systems up to date.",
    },
    {
      label: "Monitoring:",
      description:
        "Regular monitoring for security threats and vulnerabilities.",
    },
    {
      label: "Incident Response:",
      description:
        "Procedures for responding to data breaches or security incidents.",
    },
  ];

  const dataRetentionBulletPoints = [
    {
      label: "Contact Inquiries:",
      description: "Retained for up to 3 years after resolution.",
    },
    {
      label: "Business Listings:",
      description:
        "Retained while the business remains listed and for 1 year after removal.",
    },
    {
      label: "Usage Analytics:",
      description:
        "Aggregated data may be retained indefinitely; individual data retained for up to 2 years.",
    },
    {
      label: "Legal Requirements:",
      description:
        "Some information may be retained longer to comply with legal obligations.",
    },
  ];

  const yourPrivacyRightsBulletPoints = [
    {
      title: "Access and Portability:",
      bulletPoints: [
        {
          label: "Request access to personal information we hold about you",
        },
        {
          label:
            "Request a copy of your personal information in a portable format",
        },
      ],
    },
    {
      title: "Correction and Updates:",
      bulletPoints: [
        {
          label:
            "Request correction of inaccurate or incomplete personal information",
        },
        {
          label: "Update your contact information or preferences",
        },
      ],
    },
    {
      title: "Deletion:",
      bulletPoints: [
        {
          label:
            "Request deletion of your personal information, subject to legal requirements",
        },
        {
          label: "Request removal of reviews or feedback you've submitted",
        },
      ],
    },
    {
      title: "Objection and Restriction:",
      bulletPoints: [
        {
          label: "Object to certain uses of your personal information",
        },
      ],
    },
    {
      title: "Withdraw Consent:",
      bulletPoints: [
        {
          label:
            "Withdraw consent for data processing where consent is the legal basis",
        },
      ],
    },
  ];

  const paragraphSections = [
    {
      title: "Children's Privacy",
      content:
        "Our Service is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.",
    },
    {
      title: "Third-Party Links and Services",
      content:
        "Our directory contains links to third-party websites and businesses. This Privacy Policy does not apply to those third-party sites or services. We are not responsible for the privacy practices or content of third-party websites. We encourage you to review the privacy policies of any third-party sites you visit.",
    },
    {
      title: "International Data Transfers",
      content:
        "If you are located outside the United States, please note that we may transfer your information to and process it in the United States, where our servers are located and our service providers operate. By using our Service, you consent to such transfers.",
    },
  ];

  const californiaPrivacyRightsBulletPoints = [
    {
      label: "Right to Know:",
      description:
        "What personal information we collect, use, disclose, and sell.",
    },
    {
      label: "Right to Delete:",
      description: "Request deletion of personal information.",
    },
    {
      label: "Right to Opt-Out:",
      description:
        "Opt-out of the sale of personal information (we do not sell personal information).",
    },
    {
      label: "Right to Non-Discrimination:",
      description:
        "Not be discriminated against for exercising privacy rights.",
    },
  ];

  const gdprLegalBasisBulletPoints = [
    {
      label: "Consent:",
      description: "When you provide explicit consent.",
    },
    {
      label: "Contract:",
      description: "When necessary for providing our services.",
    },
    {
      label: "Legitimate Interest:",
      description: "For analytics, security, and service improvement.",
    },
    {
      label: "Legal Obligation:",
      description: "When required by law.",
    },
  ];

  const changesToThisPrivacyPolicyBulletPoints = [
    {
      label: 'Update the "Last Updated" date at the top of this policy',
    },
    {
      label:
        "Notify users of material changes via email (if we have your email address) or prominent website notice",
    },
    {
      label:
        "For significant changes, provide 30 days' notice before the changes take effect",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-slate-900 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-heading font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-300">
              Effective Date: {effectiveDate}
            </p>
            <p className="text-lg text-gray-300">Last Updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6">
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">Introduction</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            RadiatorRepairHub (&quot;we,&quot; &quot;our,&quot; &quot;us,&quot;
            or &quot;Company&quot;) operates the website {process.env.WEB_URL}{" "}
            (the &quot;Service&quot;), which provides a directory of radiator
            repair businesses. We are committed to protecting your privacy and
            handling your personal information responsibly.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or use our
            services. Please read this policy carefully. By accessing or using
            our Service, you consent to the data practices described in this
            policy.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            If you do not agree with the terms of this Privacy Policy, please do
            not access or use our Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold">
            Information We Collect
          </h2>

          {informationCollectedContent.map((item) => (
            <React.Fragment
              key={`privacy-policy-information-collected-${item.title}`}
            >
              <h3 className="text-xl font-heading font-semibold mt-8 mb-4">
                {item.title}
              </h3>
              <ul className="mt-2 text-gray-700">
                {item.bulletPoints.map((bulletPoint) => (
                  <li
                    className="flex flex-col gap-1 mb-4 ml-6"
                    key={
                      "privacy-policy-information-collected-" +
                      item.title +
                      bulletPoint.label
                    }
                  >
                    <strong>• {bulletPoint.label}</strong>{" "}
                    {bulletPoint.description}
                  </li>
                ))}
              </ul>
            </React.Fragment>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold">
            How We Use Your Information
          </h2>
          <p className="mt-2 text-gray-700">
            We use the collected information for the following purposes:
          </p>

          {howWeUseYourInformationContent.map((item) => (
            <React.Fragment
              key={`privacy-policy-how-we-use-your-information-${item.title}`}
            >
              <h3 className="text-xl font-heading font-semibold mt-8 mb-4">
                {item.title}
              </h3>
              <ul className="mt-2 text-gray-700">
                {item.bulletPoints.map((bulletPoint) => (
                  <li
                    className="flex flex-col gap-1 mb-4 ml-6"
                    key={
                      "privacy-policy-how-we-use-your-information-" +
                      item.title +
                      bulletPoint.label
                    }
                  >
                    <strong>• {bulletPoint.label}</strong>{" "}
                    {bulletPoint.description}
                  </li>
                ))}
              </ul>
            </React.Fragment>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Information Sharing and Disclosure
          </h2>
          <p className="mt-2 text-gray-700">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information only in the following limited
            circumstances:
          </p>

          {/* Service Providers */}
          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Service Providers
          </h3>
          <p className="mt-2 text-gray-700">
            We may share information with trusted third-party service providers
            who assist us in:
          </p>

          <ul className="mt-4 text-gray-700 space-y-2">
            {serviceProviderBulletPoints.map((bulletPoint) => (
              <li
                className="mb-4 ml-6"
                key={`privacy-policy-service-provider-${bulletPoint.label}`}
              >
                • {bulletPoint.label}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-gray-700">
            These providers are contractually bound to protect your information
            and use it only for specified services.
          </p>

          {/* Business Transfers */}
          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Business Transfers
          </h3>
          <p className="mt-2 text-gray-700">
            If we are involved in a merger, acquisition, or sale of assets, your
            information may be transferred as part of that transaction. We will
            provide notice before your information is transferred and becomes
            subject to a different privacy policy.
          </p>

          {/* Legal Requirements */}
          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Legal Requirements
          </h3>
          <p className="mt-2 text-gray-700">
            We may disclose your information when required by law, including:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {legalRequirementsBulletPoints.map((bulletPoint) => (
              <li
                className="mb-4 ml-6"
                key={`privacy-policy-legal-requirements-${bulletPoint.label}`}
              >
                • {bulletPoint.label}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Consent
          </h3>
          <p className="mt-2 text-gray-700">
            We may share information with your explicit consent or at your
            direction.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Data Security
          </h2>
          <p className="mt-2 text-gray-700">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. These measures
            include:
          </p>
          <ul className="mt-4 text-gray-700">
            {securityMeasuresBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={"privacy-policy-data-security-" + bulletPoint.label}
              >
                <strong>• {bulletPoint.label}</strong> {bulletPoint.description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-gray-700">
            However, no internet transmission or electronic storage is 100%
            secure. While we strive to protect your information, we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Data Retention
          </h2>
          <p className="mt-2 text-gray-700">
            We retain personal information only for as long as necessary to
            fulfill the purposes outlined in this policy or as required by law:
          </p>
          <ul className="mt-4 text-gray-700">
            {dataRetentionBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={"privacy-policy-data-retention-" + bulletPoint.label}
              >
                <strong>• {bulletPoint.label}</strong> {bulletPoint.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Your Privacy Rights
          </h2>
          <p className="mt-2 text-gray-700">
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>

          {yourPrivacyRightsBulletPoints.map((item) => (
            <React.Fragment
              key={`privacy-policy-your-privacy-rights-${item.title}`}
            >
              <h3 className="text-xl font-heading font-semibold mt-8 mb-4">
                {item.title}
              </h3>
              <ul className="mt-2 text-gray-700">
                {item.bulletPoints.map((bulletPoint) => (
                  <li
                    className="mb-4 ml-6"
                    key={`privacy-policy-your-privacy-rights-${item.title}-${bulletPoint.label}`}
                  >
                    • {bulletPoint.label}
                  </li>
                ))}
              </ul>
            </React.Fragment>
          ))}

          <p className="mt-2 text-gray-700">
            To exercise these rights, contact us at{" "}
            <a
              href={`mailto:${process.env.BUSINESS_EMAIL}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {process.env.BUSINESS_EMAIL}
            </a>
            . We will respond to your request within 30 days.
          </p>
        </section>

        {paragraphSections.map((item) => (
          <section
            className="mb-12"
            key={`privacy-policy-paragraph-section-${item.title}`}
          >
            <h2 className="text-3xl font-heading font-bold mt-6">
              {item.title}
            </h2>
            <p className="mt-2 text-gray-700 leading-relaxed">{item.content}</p>
          </section>
        ))}

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            California Privacy Rights (CCPA)
          </h2>
          <p className="mt-2 text-gray-700">
            If you are a California resident, you have additional rights under
            the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {californiaPrivacyRightsBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={`privacy-policy-california-privacy-rights-${bulletPoint.label}`}
              >
                <strong>• {bulletPoint.label}</strong> {bulletPoint.description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-gray-700">
            To exercise these rights, contact us at{" "}
            <a
              href={`mailto:${process.env.BUSINESS_EMAIL}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {process.env.BUSINESS_EMAIL}
            </a>
            . We will respond to your request within 30 days.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            European Union Users (GDPR)
          </h2>
          <p className="mt-2 text-gray-700">
            If you are located in the European Union, you have rights under the
            General Data Protection Regulation (GDPR), including those listed in
            the &quot;Your Privacy Rights&quot; section above. Our lawful bases
            for processing your information include:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {gdprLegalBasisBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={`privacy-policy-gdpr-legal-basis-${bulletPoint.label}`}
              >
                <strong>• {bulletPoint.label}</strong> {bulletPoint.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Changes to This Privacy Policy
          </h2>
          <p className="mt-2 text-gray-700">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices, technology, legal requirements, or other
            factors. When we make changes, we will:
          </p>

          <ul className="mt-4 text-gray-700 space-y-2">
            {changesToThisPrivacyPolicyBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={`privacy-policy-changes-to-this-privacy-policy-${bulletPoint.label}`}
              >
                • {bulletPoint.label}
              </li>
            ))}
          </ul>

          <p className="mt-2 text-gray-700">
            We encourage you to review this Privacy Policy periodically to stay
            informed about how we protect your information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Contact Information
          </h2>
          <p className="mt-4 text-gray-700">
            If you have questions, concerns, or requests regarding this Privacy
            Policy or our data practices, please contact us:
          </p>
          <p className="mt-4 text-gray-700">
            <strong>Email:</strong>{" "}
            <a
              href={`mailto:${process.env.BUSINESS_EMAIL}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {process.env.BUSINESS_EMAIL}
            </a>
          </p>
          <p className="mt-6 text-gray-700">
            We will try to respond to inquiries within 30 days of receipt.
          </p>
        </section>

        <p className="mb-12 text-gray-500 font-bold italic text-center mx-auto leading-relaxed">
          By using RadiatorRepairHub, you acknowledge that you have read and
          understood this Privacy Policy and agree to our data practices as
          described herein.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
