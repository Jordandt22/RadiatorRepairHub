import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";
import SiteSupportContactLines from "@/components/contact/SiteSupportContactLines";
import {
  DEFAULT_OG_IMAGE,
  INDEX_ROBOTS,
  SITE_URL,
} from "@/lib/seo/metadata";

export const metadata = {
  title: "Terms of Service | User Agreement & Legal Terms - RadiatorRepairHub",
  description:"RadiatorRepairHub terms of service: directory use, Quick Contact, business claims, Featured listings, listing reports, accounts, Shop affiliate links, and user responsibilities.",
  keywords:"terms of service, user agreement, legal terms, terms and conditions, service agreement, user rights",
  openGraph: {
    title:"Terms of Service | User Agreement & Legal Terms - RadiatorRepairHub",
    description:"RadiatorRepairHub terms of service: directory use, Quick Contact, business claims, Featured listings, listing reports, accounts, Shop affiliate links, and user responsibilities.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    url: `${SITE_URL}/terms`,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  robots: INDEX_ROBOTS,
};

function TermsPage() {
  const effectiveDate = new Date("2025-09-22").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const lastUpdated = new Date(2026, 7, 28).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const serviceDescriptionPoints = ["A searchable database of radiator repair shops and service providers","Business contact information, locations, hours, services, photos, and third-party review summaries","Search and filtering capabilities","Educational blog and FAQ content about radiator repair and using the directory","General contact forms for directory questions, listing help, and feedback","Quick Contact, a tool to submit service inquiries to claimed business listings","Business claiming, so eligible owners can verify listing email access and create an account to manage their listing through a dashboard and account settings, including listing analytics","Optional paid Featured listing upgrades for claimed businesses, billed through Stripe","Report Info, a tool to report incorrect claim contact details, incorrect or outdated listing info, or inappropriate listing content","An optional short site feedback survey that may appear after you submit certain forms","A Tools & Supplies Shop and related product recommendations, including Amazon Associate affiliate links",
  ];

  const quickContactTermsPoints = ["You agree to provide accurate and complete information when submitting a contact form or Quick Contact message.","Submitting a form constitutes your consent to our Privacy Policy and the processing of the information you provide.","After a successful Contact, Get Listed, or Quick Contact submission, we may show an optional short site feedback survey. Responses are voluntary and described in our Privacy Policy.","Quick Contact is available only on claimed business listings. For unclaimed listings, use the phone number, email, or website shown on the listing.","Quick Contact messages are reviewed before they may be forwarded to a listed business; delivery is not guaranteed and may take additional time.","We may decline, flag, archive, or not forward messages that appear fraudulent, abusive, incomplete, undeliverable, or otherwise inappropriate.","We may verify the email address you provide before accepting Contact, Get Listed, Quick Contact, or listing report submissions.","We facilitate communication between you and listed businesses but do not guarantee a response, appointment, quote, or repair outcome.","Your repair or service relationship, if any, is solely between you and the listed business.",
  ];

  const claimTermsPoints = ["Claiming is available only for eligible listings, typically those with a unique email address on file that can receive a verification message.","Claiming a listing is free. Featured listing upgrades are optional and paid separately.","By starting or completing a claim, you represent that you are an authorized owner or representative of the business and that the information you provide is accurate.","We may send a verification code or link to the email address associated with the listing. Access to that inbox is part of how we confirm eligibility.","We may deny, pause, expire, cancel, or reverse a claim if we cannot verify authorization, if eligibility requirements are not met, or if we suspect fraud or abuse.","Self-serve claiming may be unavailable when a listing has no email on file or when the same email is shared across multiple listings. In those cases, use Report Info or contact us for help.","After a successful claim, you may create or use an account to manage the claimed listing through the dashboard and account settings, including listing analytics, subject to these Terms and our Privacy Policy.","You may unclaim a listing you own through your account. Unclaiming removes your owner access; the public listing remains on RadiatorRepairHub and may be claimed again later. If the listing is Featured, unclaiming cancels the Featured subscription immediately as described in Featured Listings and Billing.","When you update listing contact details through your account, we may verify changed phone numbers or email addresses before saving them.","Claiming does not transfer ownership of our directory data or grant you rights beyond managing your listing through the Service.",
  ];

  const featuredListingTermsPoints = ["Featured is an optional paid upgrade available only for claimed listings you own.","Featured benefits may include a Featured badge, priority placement in search, state, city, and category listings, and inclusion on the Featured businesses page. Featured listings are generally shown ahead of non-Featured listings. Featured does not guarantee a specific rank, homepage module, or number of views. Benefits and pricing may change; current details are shown on our Featured listing pricing page.","Featured subscriptions are billed monthly through Stripe in advance for each billing period. Applicable taxes may be added at checkout.","Featured placement is applied after Stripe confirms payment (typically via webhook). Reaching a checkout success page does not by itself guarantee that Featured is already live if confirmation is still in progress.","You can manage or cancel a Featured subscription through the Stripe customer billing portal linked from your account Settings. Canceling through the portal stops future renewals; Featured access for the current paid period generally continues until the period ends, subject to Stripe and the plan terms in effect when you cancel.","Featured fees are non-refundable. We do not provide refunds or credits for partial billing periods, unused time, early cancellation, unclaiming a listing, or deleting your account.","If you delete your account or unclaim a Featured listing, we cancel the related Featured subscription immediately and remove Featured placement. That immediate cancel does not create a right to a refund for the current period.","We may keep Featured active during limited payment-recovery states (such as past due) and remove Featured when a subscription is canceled, unpaid, incomplete and expired, or otherwise ended under Stripe.","Purchasing Featured does not guarantee a specific number of leads, calls, or sales. Placement and visibility depend on directory usage and other listings.","We may suspend or remove Featured status if payment fails, the subscription ends, the listing is unclaimed, or we detect abuse or Terms violations.","Featured is advertising/placement within our directory. It is not an endorsement of service quality and does not change that your customer relationships remain between you and your customers.",
  ];

  const listingReportTermsPoints = ["You agree to provide accurate information when submitting a Report Info form or reporting a listing problem through our contact form.","We may verify the email address you provide and review reports before making any listing changes.","Submitting a report does not guarantee that we will change the listing, approve a claim, or respond within a specific timeframe.","We may decline, archive, or take no action on reports that appear incomplete, abusive, fraudulent, or unsupported.","Suggested phone numbers or emails you provide may be used to update listing contact details after review, when appropriate.","After a successful Report Info submission, we may show an optional short site feedback survey. Responses are voluntary and described in our Privacy Policy.",
  ];

  const affiliateTermsPoints = ["Our Shop page and certain blog, home, FAQ, and business listing pages may display Tools & Supplies or other product recommendations with links to third-party retailers such as Amazon.","As an Amazon Associate, RadiatorRepairHub may earn from qualifying purchases. Product sections include affiliate disclosures.","Affiliate product links open on third-party sites. Purchases, shipping, returns, warranties, and product quality are solely between you and the retailer.","We do not guarantee product availability, pricing, compatibility, or fitness for your vehicle or repair needs.","Affiliate recommendations are not endorsements of any listed radiator repair business, and listed businesses are not responsible for affiliate products shown near their listings.",
  ];

  const capacityRequirements = ["You have the legal capacity to enter into this Agreement","You are not prohibited from using the Service under applicable law","Your use of the Service will not violate any applicable law or regulation",
  ];

  const permittedUses = ["Search for radiator repair businesses in your area","View business contact information and details","Contact businesses through provided information","Read blog, FAQ, and other educational content on the Service","Browse Tools & Supplies recommendations and follow affiliate product links","Submit general inquiries through our site contact forms","Submit service inquiries to claimed listings through Quick Contact, subject to review","Claim an eligible business listing you are authorized to represent, and manage that listing through your account","View listing analytics for a claimed business you own","Unclaim a listing you own, which may cancel an active Featured subscription as described in these Terms","Purchase or manage an optional Featured listing upgrade for a claimed business you own","Report incorrect claim contact information, incorrect or outdated listing info, or inappropriate listing content through Report Info","Optionally respond to a short site feedback survey after submitting certain forms","Access publicly available information about listed businesses",
  ];

  const dataMisusePoints = ["Scraping, harvesting, or systematically collecting data from the Website","Using automated tools, bots, or scripts to access or extract information","Copying, reproducing, or distributing substantial portions of our directory data","Creating derivative databases or competing services using our data",
  ];

  const technicalInterferencePoints = ["Attempting to gain unauthorized access to our systems, servers, or networks","Interfering with or disrupting the Service or servers connected to the Service","Introducing viruses, malware, or other harmful code","Circumventing security measures or access controls",
  ];

  const fraudulentActivitiesPoints = ["Providing false, misleading, or inaccurate information","Impersonating another person, business, or entity","Claiming a business listing you do not own or are not authorized to represent","Submitting false, abusive, or repeated listing reports","Using the Service for spam, phishing, or other deceptive practices","Submitting fraudulent, abusive, or repetitive contact form or Quick Contact messages","Posting defamatory, abusive, or inappropriate content","Engaging in any illegal activities or encouraging others to do so",
  ];

  const commercialMisusePoints = ["Using the Service for unauthorized advertising or promotional activities","Soliciting users for commercial purposes without permission","Competing directly with our Service using information obtained from our platform","Reselling or redistributing our directory information without authorization",
  ];

  const intellectualPropertyViolationsPoints = ["Infringing on our intellectual property rights or those of listed businesses","Using our trademarks, logos, or branding without permission","Copying our website design, layout, or functionality",
  ];

  const intellectualPropertyPoints = ["Website design, layout, and user interface","Proprietary algorithms and search functionality","Trademarks, logos, and branding elements","Compilation and organization of directory data","Original written content and descriptions",
  ];

  const restrictionsPoints = ["Copy, modify, or distribute our content without written permission","Use our trademarks or branding in any manner","Create derivative works based on our Service","Remove or alter any copyright, trademark, or proprietary notices",
  ];

  const disclaimersPoints = ["Implied warranties of merchantability and fitness for a particular purpose","Warranties of non-infringement","Warranties that the Service will be uninterrupted or error-free",
  ];

  const noWarrantyPoints = ["The accuracy, completeness, or timeliness of business listings","The quality, reliability, or availability of listed businesses","The results you may obtain from using listed services","The safety or legality of interactions with listed businesses","That a business claim will succeed, remain approved, or resolve ownership disputes","That a listing report will result in a specific correction or outcome","That a Featured listing will produce a specific number of leads, calls, views, or sales","The accuracy of third-party review scores or review counts displayed on listings","Affiliate product availability, pricing, compatibility, or purchase outcomes on Amazon or other retailers",
  ];

  const technicalLimitationsPoints = ["The Service will meet your specific requirements","The Service will be available at all times","All technical issues will be corrected promptly","The Service will be compatible with all devices or browsers",
  ];

  const liabilityDamagesPoints = ["Direct, indirect, incidental, special, consequential, or punitive damages","Lost profits, revenue, data, or use damages","Damages arising from your use or inability to use the Service","Damages resulting from your interactions with listed businesses","Damages caused by errors, omissions, or inaccuracies in business listings","Damages arising from claim decisions, listing report reviews, Featured placement or billing status, or account actions",
  ];

  const businessInteractionPoints = ["Quality of services provided","Billing disputes or payment issues between you and a listed business","Property damage or personal injury","Breach of contract by service providers","Fraudulent or deceptive business practices","Failure of a business to respond to a Quick Contact or other inquiry","Disputes over business ownership or who may claim a listing","Purchases, shipping, returns, or product issues arising from affiliate or third-party retailer links",
  ];

  const indemnificationPoints = ["Your use of the Service","Your violation of these Terms","Your violation of any third-party rights, including intellectual property rights","Any content you submit to the Service","Your interactions with businesses listed in our directory","Your business claim submissions, listing reports, Featured subscription purchases, or account activity",
  ];

  const terminationReasonsPoints = ["Breach of these Terms","Fraudulent or illegal activities","Unauthorized or fraudulent business claims","Abuse of Report Info or other reporting tools","Nonpayment or abuse related to Featured listing subscriptions","Violation of intellectual property rights","Abuse of the Service or other users","Extended period of inactivity",
  ];

  const terminationEffectsPoints = ["Your right to use the Service will cease immediately","We may delete your account and associated data","Claimed listings associated with a deleted or terminated account may become unclaimed","Featured placement is removed and any active Featured subscription is canceled when you delete your account, unclaim a listing, or when we terminate your account","Featured fees already paid are non-refundable, including when Featured ends early because of unclaim, account deletion, or termination","Provisions that should survive termination will remain in effect","You remain liable for any obligations incurred prior to termination",
  ];

  const modificationProcessPoints = [
    'Update the "Last Updated" date at the top of these Terms',"Provide notice of material changes through the Service or via email","Allow a reasonable period for you to review the changes",
  ];

  const arbitrationExceptionsPoints = ["Claims for injunctive or equitable relief","Claims related to intellectual property rights","Small claims court actions under applicable limits",
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Terms", url: "/terms" },
  ];

  const pageTitle = "Terms of Service";
  const pageDescription = `Effective Date: ${effectiveDate} | Last Updated: ${lastUpdated}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
      />

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6">
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Agreement to Terms
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            These Terms of Service (&quot;Terms,&quot; &quot;Agreement&quot;)
            govern your use of the RadiatorRepairHub website located at{" "}
            {process.env.WEB_URL} (the &quot;Service,&quot; &quot;Website&quot;)
            operated by RadiatorRepairHub (&quot;we,&quot; &quot;us,&quot;
            &quot;our,&quot; or &quot;Company&quot;).
          </p>
          <p className="mt-4 text-foreground leading-relaxed">
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
          <p className="mt-4 text-foreground leading-relaxed">
            RadiatorRepairHub operates as an online directory that connects
            consumers with radiator repair businesses. Our Service includes:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {serviceDescriptionPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
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
          <p className="mt-2 text-foreground leading-relaxed">
            You must be at least 13 years of age to use this Service. The
            Service is not intended for children under 13, and we do not
            knowingly collect personal information from children under 13. If
            you are under 13, you may not use the Service.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Capacity
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            By using our Service, you represent and warrant that:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-4 text-foreground leading-relaxed">
            You may use our Service for the following purposes:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-4 text-foreground leading-relaxed">
            You agree NOT to use the Service for any of the following prohibited
            activities:
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Data Misuse
          </h3>
          <ul className="mt-2 text-foreground space-y-2">
            {dataMisusePoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Technical Interference
          </h3>
          <ul className="mt-2 text-foreground space-y-2">
            {technicalInterferencePoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Fraudulent or Harmful Activities
          </h3>
          <ul className="mt-2 text-foreground space-y-2">
            {fraudulentActivitiesPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Commercial Misuse
          </h3>
          <ul className="mt-2 text-foreground space-y-2">
            {commercialMisusePoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Intellectual Property Violations
          </h3>
          <ul className="mt-2 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground leading-relaxed">
            While we strive to provide accurate and up-to-date business
            information, we cannot guarantee the completeness, accuracy, or
            reliability of all listings. Business information is:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            <li className="mb-2 ml-6">
              • Provided by third parties, obtained from public sources, or
              submitted by users and business owners
            </li>
            <li className="mb-2 ml-6">• Subject to change without notice</li>
            <li className="mb-2 ml-6">
              • Not independently verified by us for every listing, even when a
              listing shows as claimed
            </li>
            <li className="mb-2 ml-6">
              • May include aggregated ratings or review counts from third-party
              sources such as Google; we do not host an on-site review
              submission form for listed businesses
            </li>
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Claimed Listings
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Some listings may be claimed by a business owner or authorized
            representative. Claiming helps owners manage listing details through
            an account, but it does not mean we endorse the business or guarantee
            the accuracy of every field. We may update, unclaim, or remove a
            listing if we receive credible reports, detect abuse, or otherwise
            need to maintain the directory.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            No Endorsement
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Inclusion in our directory does not constitute an endorsement,
            recommendation, or guarantee of any business or their services. We
            do not:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground leading-relaxed">
            Your interactions with businesses listed in our directory are solely
            between you and that business. We are not a party to any agreements,
            transactions, or disputes between users and listed businesses.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Contact Forms and Quick Contact
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            Our Service includes general contact forms for directory questions,
            listing help, and website feedback, as well as Quick Contact on
            claimed business listing pages for service-related inquiries. By using these
            forms, you agree to the following:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {quickContactTermsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
            General Contact and Get Listed submissions are stored in our
            systems, processed through our API, and trigger confirmation and
            admin notification emails through Resend. Quick Contact submissions
            are stored in our systems, processed through our API, and may
            trigger transactional emails through Resend. Details about the
            information collected and how it is used are described in our{" "}
            <a
              href="/privacy"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Business Claims and Accounts
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            Eligible business owners and authorized representatives may claim a
            listing and create an account to manage it. By using claiming or
            account features, you agree to the following:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {claimTermsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
            More detail on eligibility and steps is available on our{" "}
            <a
              href="/how-to-claim"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              How to Claim
            </a>{" "}
            page. Account and claim-related data practices are described in our{" "}
            <a
              href="/privacy"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Featured Listings and Billing
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            Claimed business owners may purchase an optional Featured listing
            upgrade. By starting checkout, completing a purchase, or managing a
            Featured subscription, you agree to these Terms, our{" "}
            <a
              href="/privacy"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              Privacy Policy
            </a>
            , and the following:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {featuredListingTermsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
            Current pricing and upgrade steps are on our{" "}
            <a
              href="/pricing"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              Featured listing pricing
            </a>{" "}
            page. Payment processing is handled by Stripe under Stripe&apos;s
            terms; we do not store your full payment card details on our
            servers.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Listing Reports (Report Info)
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            Our Service includes Report Info on business listing pages so users
            can report wrong claim contact information, incorrect or outdated
            listing details, or inappropriate listing content. You may also
            report listing problems through our contact form. By submitting a
            report, you agree to the following:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {listingReportTermsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
            Listing reports are stored in our systems and may trigger internal
            admin notifications through Resend. Details about the information
            collected and how it is used are described in our{" "}
            <a
              href="/privacy"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Tools &amp; Supplies and Affiliate Links
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            Parts of the Service include product recommendations and a Shop
            experience. By using those features, you agree to the following:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {affiliateTermsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
            More detail on how affiliate click analytics work is described in
            our{" "}
            <a
              href="/privacy"
              className="text-interactive underline transition-colors hover:text-interactive/80"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Intellectual Property Rights
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Our Intellectual Property
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            The Service and all content, features, and functionality are owned
            by RadiatorRepairHub and are protected by United States and
            international copyright, trademark, patent, trade secret, and other
            intellectual property laws. This includes:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {intellectualPropertyPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Limited License to Users
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            We grant you a limited, non-exclusive, non-transferable, revocable
            license to access and use the Service for personal purposes and, if
            you are a claimed business owner or authorized representative, to
            manage your claimed listing(s) through your account, subject to
            these Terms.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Restrictions
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">You may not:</p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-4 text-foreground leading-relaxed">
            Your privacy is important to us. Our collection, use, and disclosure
            of personal information is governed by our Privacy Policy, which is
            incorporated into these Terms by reference. By using our Service,
            you consent to our data practices as described in the Privacy
            Policy.
          </p>
          <p className="mt-4 text-foreground leading-relaxed">
            To operate and improve the Service, we use third-party tools that
            may collect information about your visit, including:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            <li className="mb-2 ml-6">
              • <strong>Google Analytics</strong> - website traffic and usage
              analytics
            </li>
            <li className="mb-2 ml-6">
              • <strong>PostHog</strong> - product analytics and page
              interaction tracking (including claims and Featured checkout /
              billing events)
            </li>
            <li className="mb-2 ml-6">
              • <strong>Cloudflare</strong> - content delivery, DNS, images,
              security, and bot protection
            </li>
            <li className="mb-2 ml-6">
              • <strong>Arcjet</strong> - API bot protection, shielding, and
              rate limiting
            </li>
            <li className="mb-2 ml-6">
              • <strong>Resend</strong> - transactional email for Contact, Get
              Listed, Quick Contact, claim verification, listing report
              notifications, Featured purchase admin notices, and related
              communications
            </li>
            <li className="mb-2 ml-6">
              • <strong>Supabase</strong> - database storage and authentication
              for directory data, contact inquiries, listing requests, contact
              messages, accounts, claim requests, Featured subscription records,
              listing reports, and feedback surveys
            </li>
            <li className="mb-2 ml-6">
              • <strong>Stripe</strong> - payment and subscription processing
              for optional Featured listing upgrades, including Checkout, tax
              calculation where enabled, webhooks, and the customer billing
              portal
            </li>
            <li className="mb-2 ml-6">
              • <strong>Abstract API</strong> - email address verification for
              Contact, Get Listed, Quick Contact, and listing report
              submissions, and email/phone verification for claimed listing
              contact updates
            </li>
            <li className="mb-2 ml-6">
              • <strong>Amazon Associates</strong> - affiliate product referrals
              from our Shop and related recommendation sections
            </li>
          </ul>
          <p className="mt-4 text-foreground leading-relaxed">
            These services are described in detail in our{" "}
            <a href="/privacy" className="text-interactive underline transition-colors hover:text-interactive/80">
              Privacy Policy
            </a>
            . Your use of the Service constitutes acceptance of data collection
            by these third-party providers as outlined there.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Disclaimers and Warranties
          </h2>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Service &quot;As Is&quot;
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY
            KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {disclaimersPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            No Warranty on Business Information
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            We make no representations or warranties regarding:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {noWarrantyPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Technical Limitations
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            We do not warrant that:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
            RADIATORREPAIRHUB, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR
            SUPPLIERS BE LIABLE FOR ANY DAMAGES INCLUDING:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {liabilityDamagesPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Maximum Liability
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Our total liability to you for all damages, losses, and causes of
            action (whether in contract, tort, or otherwise) shall not exceed
            the amount you have paid us, if any, for using the Service in the
            twelve (12) months&apos; preceding the claim.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Business Interactions
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            We are not liable for any disputes, damages, or issues arising from
            your interactions with businesses listed in our directory, including
            but not limited to:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-4 text-foreground leading-relaxed">
            You agree to defend, indemnify, and hold harmless RadiatorRepairHub
            and its officers, directors, employees, agents, and suppliers from
            and against any claims, damages, obligations, losses, liabilities,
            costs, and expenses (including attorney&apos;s fees) arising from:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground leading-relaxed">
            You may stop using the Service at any time. If you have an account
            with us, you may delete your account through account settings or by
            contacting us. Deleting your account may cause listings you own to
            become unclaimed. If you have an active Featured subscription, we
            cancel it when your account is deleted (or when the related listing
            is unclaimed) so billing does not continue. Featured fees already
            paid are non-refundable. You can also cancel Featured earlier through
            the Stripe billing portal in Settings to stop future renewals.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Termination by Us
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            We may terminate or suspend your access to the Service immediately,
            without prior notice, for any reason, including:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {terminationReasonsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Effect of Termination
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Upon termination:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. When we make
            changes, we will:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {modificationProcessPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Acceptance of Changes
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Your continued use of the Service after we post revised Terms means
            you accept and agree to the changes. If you do not agree to the
            revised Terms, you must stop using the Service.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Material Changes
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
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
          <p className="mt-2 text-foreground leading-relaxed">
            These Terms and your use of the Service are governed by and
            construed in accordance with the laws of the State of California,
            United States, without regard to its conflict of law principles.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Jurisdiction and Venue
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Any legal action or proceeding relating to these Terms or the
            Service shall be brought exclusively in the federal or state courts
            located in San Francisco, California. You consent to the
            jurisdiction of such courts and waive any objection to venue.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Mandatory Arbitration
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Any dispute, claim, or controversy arising out of or relating to
            these Terms or the Service shall be resolved through binding
            arbitration administered by the American Arbitration Association
            (AAA) under its Commercial Arbitration Rules. The arbitration shall
            be conducted in San Francisco, California.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Exceptions to Arbitration
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            The following disputes are not subject to arbitration:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {arbitrationExceptionsPoints.map((point, index) => (
              <li key={index} className="mb-2 ml-6">
                • {point}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Class Action Waiver
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
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
          <p className="mt-2 text-foreground leading-relaxed">
            These Terms, together with our Privacy Policy and any additional
            terms referenced herein, constitute the entire agreement between you
            and RadiatorRepairHub regarding the Service.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Severability
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            If any provision of these Terms is held to be invalid, illegal, or
            unenforceable, the remaining provisions shall remain in full force
            and effect.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Waiver
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            Our failure to enforce any provision of these Terms shall not
            constitute a waiver of such provision or any other provision.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Assignment
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            You may not assign or transfer these Terms or your rights under
            these Terms without our prior written consent. We may assign these
            Terms without restriction.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Headings
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
            The headings in these Terms are for convenience only and have no
            legal or contractual effect.
          </p>

          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Force Majeure
          </h3>
          <p className="mt-2 text-foreground leading-relaxed">
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
          <p className="mt-4 text-foreground">
            If you have any questions about these Terms of Service, please
            contact us:
          </p>
          <SiteSupportContactLines />
          <p className="mt-6 text-foreground">
            We will try to respond to inquiries within 30 days of receipt.
          </p>
        </section>

        <p className="mb-12 text-muted-foreground font-bold italic text-center w-3/4 mx-auto leading-relaxed">
          By using RadiatorRepairHub, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
