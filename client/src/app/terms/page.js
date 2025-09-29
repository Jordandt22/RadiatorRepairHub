import React from "react";

export const metadata = {
  title: "Terms of Service | User Agreement & Legal Terms - RadiatorRepairHub",
  description:
    "Read RadiatorRepairHub's terms of service and user agreement. Understand your rights and responsibilities when using our radiator repair directory service.",
  keywords:
    "terms of service, user agreement, legal terms, terms and conditions, service agreement, user rights",
  openGraph: {
    title:
      "Terms of Service | User Agreement & Legal Terms - RadiatorRepairHub",
    description:
      "Read RadiatorRepairHub's terms of service and user agreement. Understand your rights and responsibilities when using our radiator repair directory service.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Terms of Service | User Agreement & Legal Terms - RadiatorRepairHub",
    description:
      "Read RadiatorRepairHub's terms of service and user agreement. Understand your rights and responsibilities when using our radiator repair directory service.",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/terms",
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

function TermsPage() {
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

  const serviceDescriptionPoints = [
    "A searchable database of radiator repair shops and service providers",
    "Business contact information, locations, and service details",
    "Search and filtering capabilities",
    "Contact forms and communication tools",
  ];

  const capacityRequirements = [
    "You have the legal capacity to enter into this Agreement",
    "You are not prohibited from using the Service under applicable law",
    "Your use of the Service will not violate any applicable law or regulation",
  ];

  const permittedUses = [
    "Search for radiator repair businesses in your area",
    "View business contact information and details",
    "Contact businesses through provided information",
    "Access publicly available information about listed businesses",
  ];

  const dataMisusePoints = [
    "Scraping, harvesting, or systematically collecting data from the Website",
    "Using automated tools, bots, or scripts to access or extract information",
    "Copying, reproducing, or distributing substantial portions of our directory data",
    "Creating derivative databases or competing services using our data",
  ];

  const technicalInterferencePoints = [
    "Attempting to gain unauthorized access to our systems, servers, or networks",
    "Interfering with or disrupting the Service or servers connected to the Service",
    "Introducing viruses, malware, or other harmful code",
    "Circumventing security measures or access controls",
  ];

  const fraudulentActivitiesPoints = [
    "Providing false, misleading, or inaccurate information",
    "Impersonating another person, business, or entity",
    "Using the Service for spam, phishing, or other deceptive practices",
    "Posting defamatory, abusive, or inappropriate content",
    "Engaging in any illegal activities or encouraging others to do so",
  ];

  const commercialMisusePoints = [
    "Using the Service for unauthorized advertising or promotional activities",
    "Soliciting users for commercial purposes without permission",
    "Competing directly with our Service using information obtained from our platform",
    "Reselling or redistributing our directory information without authorization",
  ];

  const intellectualPropertyViolationsPoints = [
    "Infringing on our intellectual property rights or those of listed businesses",
    "Using our trademarks, logos, or branding without permission",
    "Copying our website design, layout, or functionality",
  ];

  const intellectualPropertyPoints = [
    "Website design, layout, and user interface",
    "Proprietary algorithms and search functionality",
    "Trademarks, logos, and branding elements",
    "Compilation and organization of directory data",
    "Original written content and descriptions",
  ];

  const restrictionsPoints = [
    "Copy, modify, or distribute our content without written permission",
    "Use our trademarks or branding in any manner",
    "Create derivative works based on our Service",
    "Remove or alter any copyright, trademark, or proprietary notices",
  ];

  const disclaimersPoints = [
    "Implied warranties of merchantability and fitness for a particular purpose",
    "Warranties of non-infringement",
    "Warranties that the Service will be uninterrupted or error-free",
  ];

  const noWarrantyPoints = [
    "The accuracy, completeness, or timeliness of business listings",
    "The quality, reliability, or availability of listed businesses",
    "The results you may obtain from using listed services",
    "The safety or legality of interactions with listed businesses",
  ];

  const technicalLimitationsPoints = [
    "The Service will meet your specific requirements",
    "The Service will be available at all times",
    "All technical issues will be corrected promptly",
    "The Service will be compatible with all devices or browsers",
  ];

  const liabilityDamagesPoints = [
    "Direct, indirect, incidental, special, consequential, or punitive damages",
    "Lost profits, revenue, data, or use damages",
    "Damages arising from your use or inability to use the Service",
    "Damages resulting from your interactions with listed businesses",
    "Damages caused by errors, omissions, or inaccuracies in business listings",
  ];

  const businessInteractionPoints = [
    "Quality of services provided",
    "Billing disputes or payment issues",
    "Property damage or personal injury",
    "Breach of contract by service providers",
    "Fraudulent or deceptive business practices",
  ];

  const indemnificationPoints = [
    "Your use of the Service",
    "Your violation of these Terms",
    "Your violation of any third-party rights, including intellectual property rights",
    "Any content you submit to the Service",
    "Your interactions with businesses listed in our directory",
  ];

  const terminationReasonsPoints = [
    "Breach of these Terms",
    "Fraudulent or illegal activities",
    "Violation of intellectual property rights",
    "Abuse of the Service or other users",
    "Extended period of inactivity",
  ];

  const terminationEffectsPoints = [
    "Your right to use the Service will cease immediately",
    "We may delete your account and associated data",
    "Provisions that should survive termination will remain in effect",
    "You remain liable for any obligations incurred prior to termination",
  ];

  const modificationProcessPoints = [
    'Update the "Last Updated" date at the top of these Terms',
    "Provide notice of material changes through the Service or via email",
    "Allow a reasonable period for you to review the changes",
  ];

  const arbitrationExceptionsPoints = [
    "Claims for injunctive or equitable relief",
    "Claims related to intellectual property rights",
    "Small claims court actions under applicable limits",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-slate-900 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-heading font-bold text-white mb-6">
              Terms of Service
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
          <h2 className="text-3xl font-heading font-bold mt-6">
            Agreement to Terms
          </h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            These Terms of Service (&quot;Terms,&quot; &quot;Agreement&quot;)
            govern your use of the RadiatorRepairHub website located at{" "}
            {process.env.WEB_URL} (the &quot;Service,&quot; &quot;Website&quot;)
            operated by RadiatorRepairHub (&quot;we,&quot; &quot;us,&quot;
            &quot;our,&quot; or &quot;Company&quot;).
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            By accessing or using our Service, you agree to be bound by these
            Terms. If you disagree with any part of these Terms, then you may
            not access the Service. These Terms apply to all visitors, users,
            and others who access or use the Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Description of Service
          </h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            RadiatorRepairHub operates as an online directory that connects
            consumers with radiator repair businesses. Our Service includes:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {serviceDescriptionPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-700 leading-relaxed">
            We act solely as an intermediary platform and do not provide
            radiator repair services directly.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Acceptance and Eligibility
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Age Requirements
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            You must be at least 13 years of age to use this Service. If you are
            under 13, you may only use the Service with the involvement and
            consent of a parent or legal guardian.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Capacity
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            By using our Service, you represent and warrant that:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {capacityRequirements.map((requirement, index) => (
              <li key={index} className="mb-2 ml-6">
                • {requirement}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Permitted Uses
          </h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            You may use our Service for the following purposes:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {permittedUses.map((use, index) => (
              <li key={index} className="mb-2 ml-6">
                • {use}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Prohibited Uses and Conduct
          </h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            You agree NOT to use the Service for any of the following prohibited
            activities:
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Data Misuse
          </h3>
          <ul className="mt-2 text-gray-700 space-y-2">
            {dataMisusePoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Technical Interference
          </h3>
          <ul className="mt-2 text-gray-700 space-y-2">
            {technicalInterferencePoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Fraudulent or Harmful Activities
          </h3>
          <ul className="mt-2 text-gray-700 space-y-2">
            {fraudulentActivitiesPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Commercial Misuse
          </h3>
          <ul className="mt-2 text-gray-700 space-y-2">
            {commercialMisusePoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Intellectual Property Violations
          </h3>
          <ul className="mt-2 text-gray-700 space-y-2">
            {intellectualPropertyViolationsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Business Listings and Directory Information
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Information Accuracy
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            While we strive to provide accurate and up-to-date business
            information, we cannot guarantee the completeness, accuracy, or
            reliability of all listings. Business information is:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            <li className="mb-2 ml-6">
              • Provided by third parties or obtained from public sources
            </li>
            <li className="mb-2 ml-6">• Subject to change without notice</li>
            <li className="mb-2 ml-6">
              • Not verified by us unless specifically stated
            </li>
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            No Endorsement
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Inclusion in our directory does not constitute an endorsement,
            recommendation, or guarantee of any business or their services. We
            do not:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            <li className="mb-2 ml-6">
              • Vouch for the quality of services provided by listed businesses
            </li>
            <li className="mb-2 ml-6">
              • Guarantee the availability or accuracy of business information
            </li>
            <li className="mb-2 ml-6">
              • Assume responsibility for business practices or service quality
            </li>
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Third-Party Relationships
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Your interactions with businesses listed in our directory are solely
            between you and that business. We are not a party to any agreements,
            transactions, or disputes between users and listed businesses.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Intellectual Property Rights
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Our Intellectual Property
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            The Service and all content, features, and functionality are owned
            by RadiatorRepairHub and are protected by United States and
            international copyright, trademark, patent, trade secret, and other
            intellectual property laws. This includes:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {intellectualPropertyPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Limited License to Users
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We grant you a limited, non-exclusive, non-transferable, revocable
            license to access and use the Service for personal, non-commercial
            purposes, subject to these Terms.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Restrictions
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">You may not:</p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {restrictionsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Privacy and Data Protection
          </h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Your privacy is important to us. Our collection, use, and disclosure
            of personal information is governed by our Privacy Policy, which is
            incorporated into these Terms by reference. By using our Service,
            you consent to our data practices as described in the Privacy
            Policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Disclaimers and Warranties
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Service &quot;As Is&quot;
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY
            KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {disclaimersPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            No Warranty on Business Information
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We make no representations or warranties regarding:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {noWarrantyPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Technical Limitations
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We do not warrant that:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {technicalLimitationsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Limitation of Liability
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Scope of Limitation
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
            RADIATORREPAIRHUB, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR
            SUPPLIERS BE LIABLE FOR ANY DAMAGES INCLUDING:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {liabilityDamagesPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Maximum Liability
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Our total liability to you for all damages, losses, and causes of
            action (whether in contract, tort, or otherwise) shall not exceed
            the amount you have paid us, if any, for using the Service in the
            twelve (12) months&apos; preceding the claim.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Business Interactions
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We are not liable for any disputes, damages, or issues arising from
            your interactions with businesses listed in our directory, including
            but not limited to:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {businessInteractionPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Indemnification
          </h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            You agree to defend, indemnify, and hold harmless RadiatorRepairHub
            and its officers, directors, employees, agents, and suppliers from
            and against any claims, damages, obligations, losses, liabilities,
            costs, and expenses (including attorney&apos;s fees) arising from:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {indemnificationPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">Termination</h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Termination by You
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            You may stop using the Service at any time. If you have an account
            with us, you may delete your account by contacting us.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Termination by Us
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We may terminate or suspend your access to the Service immediately,
            without prior notice, for any reason, including:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {terminationReasonsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Effect of Termination
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Upon termination:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {terminationEffectsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Modification of Terms
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Right to Modify
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms at any time. When we make
            changes, we will:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {modificationProcessPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Acceptance of Changes
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Your continued use of the Service after we post revised Terms means
            you accept and agree to the changes. If you do not agree to the
            revised Terms, you must stop using the Service.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Material Changes
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            For significant changes that materially affect your rights, we will
            provide at least 30 days&apos; notice before the changes take
            effect.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Dispute Resolution
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Governing Law
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            These Terms and your use of the Service are governed by and
            construed in accordance with the laws of the State of California,
            United States, without regard to its conflict of law principles.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Jurisdiction and Venue
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Any legal action or proceeding relating to these Terms or the
            Service shall be brought exclusively in the federal or state courts
            located in San Francisco, California. You consent to the
            jurisdiction of such courts and waive any objection to venue.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Mandatory Arbitration
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Any dispute, claim, or controversy arising out of or relating to
            these Terms or the Service shall be resolved through binding
            arbitration administered by the American Arbitration Association
            (AAA) under its Commercial Arbitration Rules. The arbitration shall
            be conducted in San Francisco, California.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Exceptions to Arbitration
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            The following disputes are not subject to arbitration:
          </p>
          <ul className="mt-4 text-gray-700 space-y-2">
            {arbitrationExceptionsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Class Action Waiver
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            You agree that any arbitration or legal proceeding shall be limited
            to the dispute between you and us individually. You waive any right
            to participate in class action lawsuits or class-wide arbitrations.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Miscellaneous Provisions
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Entire Agreement
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            These Terms, together with our Privacy Policy and any additional
            terms referenced herein, constitute the entire agreement between you
            and RadiatorRepairHub regarding the Service.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Severability
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            If any provision of these Terms is held to be invalid, illegal, or
            unenforceable, the remaining provisions shall remain in full force
            and effect.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Waiver
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            Our failure to enforce any provision of these Terms shall not
            constitute a waiver of such provision or any other provision.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Assignment
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            You may not assign or transfer these Terms or your rights under
            these Terms without our prior written consent. We may assign these
            Terms without restriction.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Headings
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            The headings in these Terms are for convenience only and have no
            legal or contractual effect.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Force Majeure
          </h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            We shall not be liable for any failure or delay in performance under
            these Terms due to circumstances beyond our reasonable control,
            including acts of God, natural disasters, war, terrorism, or
            government actions.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Contact Information
          </h2>
          <p className="mt-4 text-gray-700">
            If you have any questions about these Terms of Service, please
            contact us:
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

        <p className="mb-12 text-gray-500 font-bold italic text-center w-3/4 mx-auto leading-relaxed">
          By using RadiatorRepairHub, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
