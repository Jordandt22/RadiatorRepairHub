import React from "react";
import PageHeader from "@/components/layout/Header/PageHeader";
import SiteSupportContactLines from "@/components/contact/SiteSupportContactLines";
import { getBusinessEmail } from "@/lib/businessContactInfo";
import {
  DEFAULT_OG_IMAGE,
  INDEX_ROBOTS,
  SITE_URL,
} from "@/lib/seo/metadata";

export const metadata = {
  title: "Privacy Policy | How We Protect Your Data - RadiatorRepairHub",
  description:"How RadiatorRepairHub collects and uses personal information for our directory, Quick Contact, business claims, Featured listing billing, listing reports, accounts, analytics, and affiliate product links.",
  keywords:"privacy policy, data protection, personal information, GDPR, CCPA, privacy rights, data security",
  openGraph: {
    title: "Privacy Policy | How We Protect Your Data - RadiatorRepairHub",
    description:"How RadiatorRepairHub collects and uses personal information for our directory, Quick Contact, business claims, Featured listing billing, listing reports, accounts, analytics, and affiliate product links.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    url: `${SITE_URL}/privacy`,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  robots: INDEX_ROBOTS,
};

function PrivacyPage() {
  const businessEmail = getBusinessEmail();
  const effectiveDate = new Date("2025-09-22").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const lastUpdated = new Date("2026-08-25").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const informationCollectedContent = [
    {
      title: "Personal Information You Provide",
      bulletPoints: [
        {
          label: "General Contact Form Submissions:",
          description:"When you use our site Contact form, we collect your name, email address, optional phone number, inquiry subject, and message. We store submissions in our database, verify your email address, send you a confirmation email, and notify our team through Resend.",
        },
        {
          label: "Get Listed Submissions:",
          description:"When you use the Get Listed form, we collect your business name, email address, optional phone number, Google Maps or Google Business Profile link, and optional notes. We store submissions in our database, verify your email address, send you a confirmation email, and notify our team through Resend so we can review and create your listing.",
        },
        {
          label: "Quick Contact Submissions:",
          description:"When you use Quick Contact on a claimed business listing, we collect your name, email address, optional phone number, the type of inquiry (Need Service or Questions), and the business you selected. For Need Service, we also collect issue type, urgency preference, optional vehicle model, and optional additional details. For Questions, we collect your message instead of issue, urgency, and vehicle. We store this information in our database, verify your email address, send you a status email, and may review the message before forwarding it to the listed business.",
        },
        {
          label: "Contact Information:",
          description:"Name, email address, and phone number when you contact us directly by email, phone, or SMS outside of our online forms. If you voluntarily include a mailing address in that communication, we may retain it as part of the correspondence.",
        },
        {
          label: "Business Information:",
          description:"If you're a business owner requesting to be listed or updating a claimed listing, we may collect business name, Google listing link, phone number, email address, website, hours, services, photos, and related information needed to create or update a directory listing. When you change a listing phone number or email through your account, we may verify those values before saving them.",
        },
        {
          label: "Business Claim Information:",
          description:"When you claim a listing, we collect the business you selected, the listing email used for verification, verification codes and related claim-request records, and the email and password you create for your account. We send a verification email to the address on file for that listing so we can confirm access before completing the claim.",
        },
        {
          label: "Listing Report (Report Info) Submissions:",
          description:"When you use Report Info on a business listing, we collect your name (optional), email address, report reason, details you provide, the business you selected, and (when reporting wrong claim contact info) any suggested phone number or email you submit so we can review and update listing contact details.",
        },
        {
          label: "Site Feedback Survey:",
          description:"After you successfully submit a Contact, Get Listed, Quick Contact, or Report Info form, we may show an optional short survey. If you choose to respond, we collect how you found RadiatorRepairHub, whether you found what you were looking for, any optional free-text feedback you provide, the form type that triggered the survey, and (when applicable) the related business listing identifier. We do not require your name or email address for the survey itself. Survey answers are stored in our database.",
        },
        {
          label: "Communication Records:",
          description:"Content of messages, emails, or other communications you send to us, including general contact form messages, Quick Contact inquiry details, claim-related emails, listing report details, and optional site feedback survey comments.",
        },
        {
          label: "Directory Ratings and Reviews:",
          description:"Listings may display aggregated ratings and review counts sourced from third-party public sources such as Google. We do not operate an on-site form for submitting reviews of listed businesses. Optional site feedback survey responses about RadiatorRepairHub are collected separately as described above.",
        },
        {
          label: "Account Information:",
          description:"Email address, password (stored in hashed form), and account profile details for business owners who create an account through the claim process or sign in to manage claimed listings. We may also store which businesses your account owns or manages, and a Stripe customer identifier if you start Featured listing checkout. If you unclaim a listing or delete your account, we clear ownership links for affected listings and cancel any related Featured subscription as described in our Terms of Service.",
        },
        {
          label: "Featured Listing Billing Information:",
          description:"When you purchase or manage a Featured listing upgrade, payment card and billing details are collected and processed by Stripe on Stripe-hosted Checkout and Customer Portal pages. We do not store your full payment card number on our servers. We may store subscription-related records such as Stripe customer ID, subscription ID, price ID, subscription status, current period end, cancel-at-period-end or cancel-at scheduling flags, and the business listing associated with the subscription so we can apply or remove Featured status and show billing status in your account Settings. Stripe may also calculate applicable taxes at checkout. We may receive Stripe webhook events about checkout and subscription status changes to keep Featured placement in sync.",
        },
      ],
    },
    {
      title: "Information Automatically Collected",
      bulletPoints: [
        {
          label: "Usage Data:",
          description:"Pages visited, time spent on pages, search queries, click patterns (including clicks on affiliate product links), and navigation paths.",
        },
        {
          label: "Device Information:",
          description:"Public IP address, browser type and version, operating system, device type, screen resolution, and unique device identifiers. Public IP address is the IP address of the device you are using to access the website. It is not your private IP address.",
        },
        {
          label: "Location Data:",
          description:"General location information based on Public IP address (city/state level, not precise location).",
        },
        {
          label: "Referral Information:",
          description:"The website or search engine that referred you to our site.",
        },
        {
          label: "Session Information:",
          description:"Date and time of visits, session duration, and pages accessed during each session.",
        },
      ],
    },
    {
      title: "Cookies and Tracking Technologies",
      bulletPoints: [
        {
          label: "Analytics Cookies:",
          description:"Help us understand how visitors use our site. We use Google Analytics and PostHog to collect usage data such as pages visited, session duration, navigation patterns, and product-interaction events (including business claims, Featured listing checkout and billing actions, and affiliate product clicks).",
        },
        {
          label: "Security and Performance Cookies:",
          description:"Cloudflare may set cookies and use similar technologies to deliver content securely, protect against malicious traffic, and improve site performance. Our API also uses Arcjet for bot detection and rate limiting, which processes request IP addresses and related request metadata.",
        },
        {
          label: "Affiliate Link Tracking:",
          description:"When you click an Amazon Associate or other affiliate product link on our Shop page, blog posts, or business listing pages, we may record an analytics event (for example, which product was clicked). Amazon or other retailers may also set their own cookies when you leave our site; those practices are governed by their privacy policies.",
        },
        {
          label: "Local Storage:",
          description:"Analytics tools may store identifiers in your browser's local storage to recognize returning visitors and maintain session continuity. We also store a small local record (`rrh_feedback_survey`) with a timestamp and whether you submitted or skipped our optional post-submit feedback survey, so we can avoid re-prompting too often (longer after a completed survey than after a skip).",
        },
      ],
    },
  ];

  const thirdPartyServicesContent = [
    {
      title: "Google Analytics",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Google LLC",
        },
        {
          label: "Purpose:",
          description:"Website traffic analysis, page views, user demographics (aggregated), and referral sources.",
        },
        {
          label: "Data Collected:",
          description:"IP address (may be anonymized), browser type, device type, pages visited, time on site, and referral URLs.",
        },
        {
          label: "Privacy Policy:",
          description:"https://policies.google.com/privacy",
        },
      ],
    },
    {
      title: "PostHog",
      bulletPoints: [
        {
          label: "Provider:",
          description: "PostHog Inc.",
        },
        {
          label: "Purpose:",
          description:"Product analytics, page view tracking, and understanding how users interact with our site (including search, forms, business claims, Featured listing checkout and billing actions, and affiliate product clicks).",
        },
        {
          label: "Data Collected:",
          description:"Page URLs, referrer, browser and device information, session identifiers, and interaction events (for example claim funnel steps, Featured checkout started/completed/canceled, billing portal opens, and Featured CTA clicks). Business identifiers such as listing ID, slug, or name may be included with those events when relevant. PostHog is configured to create user profiles only for identified users. We do not currently enable PostHog session recording on our site.",
        },
        {
          label: "Privacy Policy:",
          description: "https://posthog.com/privacy",
        },
      ],
    },
    {
      title: "Cloudflare",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Cloudflare, Inc.",
        },
        {
          label: "Purpose:",
          description:"Content delivery (CDN), image delivery, DNS resolution, DDoS protection, bot mitigation, and web application security.",
        },
        {
          label: "Data Collected:",
          description:"IP address, request headers, browser type, pages requested, and security-related logs. Cloudflare may process this data to filter malicious traffic and deliver content efficiently.",
        },
        {
          label: "Privacy Policy:",
          description: "https://www.cloudflare.com/privacypolicy/",
        },
      ],
    },
    {
      title: "Arcjet",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Arcjet Labs, Inc.",
        },
        {
          label: "Purpose:",
          description:"Protect our API from bots, abuse, and excessive request volume through bot detection, shielding, and rate limiting.",
        },
        {
          label: "Data Collected:",
          description:"Request IP address, request headers, and related request metadata needed to make security decisions. Request bodies are not sent to Arcjet for analysis under our current configuration.",
        },
        {
          label: "Privacy Policy:",
          description: "https://docs.arcjet.com/privacy/",
        },
      ],
    },
    {
      title: "Resend",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Resend, Inc.",
        },
        {
          label: "Purpose:",
          description:"Send transactional emails, including general Contact and Get Listed confirmations and admin notifications, Quick Contact acknowledgments and status updates, forwarding inquiries to listed businesses, business claim verification emails and codes, listing-live notices, and internal admin notifications for listing reports, completed claims, and Featured listing purchases.",
        },
        {
          label: "Data Collected:",
          description:"Name, email address, phone number, inquiry subject, Google listing links, vehicle information, issue details, urgency, message content, claim verification details, listing request details, listing report details, and Featured purchase notification details (such as business name, owner email, listing link, and Stripe subscription identifiers) needed to process and deliver those emails.",
        },
        {
          label: "Privacy Policy:",
          description: "https://resend.com/legal/privacy-policy",
        },
      ],
    },
    {
      title: "Supabase",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Supabase, Inc.",
        },
        {
          label: "Purpose:",
          description:"Database hosting, authentication, and backend data storage for our directory, Contact and Get Listed submissions, Quick Contact messages, user accounts, business claim requests, Featured listing subscription records, listing reports, optional site feedback survey responses, and related operational records.",
        },
        {
          label: "Data Collected:",
          description:"Contact and Get Listed submission data; Quick Contact submission data; account credentials and ownership links; claim-request records; Featured subscription records (including Stripe identifiers, status, period end, cancel scheduling flags, and linked business/owner IDs); listing report data (including reporter contact details and suggested corrections); site feedback survey answers (how you found us, whether you found what you were looking for, optional comments, form type, and related business identifiers when applicable); associated business identifiers; and operational metadata such as timestamps and processing status.",
        },
        {
          label: "Privacy Policy:",
          description: "https://supabase.com/privacy",
        },
      ],
    },
    {
      title: "Abstract API",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Abstract API, Inc.",
        },
        {
          label: "Purpose:",
          description:"Verify that email addresses submitted through Contact, Get Listed, Quick Contact, and listing reports appear deliverable before we accept and store the submission. When a claimed business owner updates listing contact details, we may also verify a changed email address (Email Reputation) and a changed phone number (Phone Intelligence).",
        },
        {
          label: "Data Collected:",
          description:"The email address you submit on Contact, Get Listed, Quick Contact, or listing report forms, and any email address or phone number a claimed owner submits when updating listing contact information.",
        },
        {
          label: "Privacy Policy:",
          description: "https://www.abstractapi.com/legal/privacy-policy",
        },
      ],
    },
    {
      title: "Amazon (Amazon Associates)",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Amazon.com, Inc. and its affiliates",
        },
        {
          label: "Purpose:",
          description:"As an Amazon Associate, we may earn from qualifying purchases when you click product links on our Shop page, blog posts, home page, FAQ, or business listing pages and complete a purchase on Amazon. Product pages on our site include affiliate disclosures.",
        },
        {
          label: "Data Collected:",
          description:"We may record analytics events when you click an affiliate product link. Amazon may collect information about your visit and purchases under its own privacy policy once you leave our site. We do not receive your Amazon account credentials or full order details from Amazon for these referrals.",
        },
        {
          label: "Privacy Policy:",
          description: "https://www.amazon.com/gp/help/customer/display.html?nodeId=468496",
        },
      ],
    },
    {
      title: "Stripe",
      bulletPoints: [
        {
          label: "Provider:",
          description: "Stripe, Inc. and its affiliates",
        },
        {
          label: "Purpose:",
          description:"Process payments and subscriptions for optional Featured listing upgrades, including Checkout, invoices, tax calculation where enabled, and the customer billing portal used to manage or cancel subscriptions. Stripe also sends us webhook events so we can sync subscription status and Featured placement.",
        },
        {
          label: "Data Collected:",
          description:"Payment method details, billing name and address, email, tax-related information, and subscription metadata as collected by Stripe. We receive and store Stripe identifiers and subscription status events (for example customer ID, subscription ID, status, period end, and cancel scheduling) so we can apply or remove Featured placement on the associated listing. Full card numbers are handled by Stripe, not stored in our databases.",
        },
        {
          label: "Privacy Policy:",
          description: "https://stripe.com/privacy",
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
          description:"Respond to inquiries, support requests, and feedback submitted through our contact forms or direct communications.",
        },
        {
          label: "Product Improvement:",
          description:"Review voluntary site feedback survey responses to understand how people discover RadiatorRepairHub, whether they found what they needed, and how we can improve the directory and form experience.",
        },
        {
          label: "Inquiry Facilitation:",
          description:"Review, process, and forward Quick Contact messages to listed businesses when appropriate.",
        },
        {
          label: "Business Claims:",
          description:"Verify listing email access, complete ownership claims, create and authenticate business owner accounts, process self-serve unclaims, and help resolve claim eligibility issues.",
        },
        {
          label: "Listing Reports:",
          description:"Review Report Info submissions, update incorrect listing or claim contact information when appropriate, and investigate inappropriate or misleading listing content.",
        },
        {
          label: "Directory Management:",
          description: "Add, update, or remove business listings.",
        },
        {
          label: "Account Management:",
          description:"Allow claimed business owners to sign in, manage listing information, unclaim listings, view subscription status, open the Stripe billing portal, delete their account, and maintain their accounts.",
        },
        {
          label: "Featured Listing Billing:",
          description:"Process optional paid Featured upgrades through Stripe, apply or remove Featured placement based on subscription status (including canceling Featured when a listing is unclaimed or an account is deleted), show billing status in account Settings, confirm checkout status after payment using Stripe session details, and send internal admin notifications when a Featured subscription is purchased.",
        },
        {
          label: "Affiliate Recommendations:",
          description:"Display Tools & Supplies and related product recommendations, measure affiliate link clicks, and participate in the Amazon Associates program.",
        },
        {
          label: "User Experience:",
          description: "Improve website functionality and user interface.",
        },
        {
          label: "Search Functionality:",
          description:"Provide relevant search results based on location and preferences.",
        },
      ],
    },
    {
      title: "Analytics and Improvement",
      bulletPoints: [
        {
          label: "Website Analytics:",
          description:"Analyze usage patterns, popular searches, and user behavior through Google Analytics and PostHog.",
        },
        {
          label: "Performance Monitoring:",
          description:"Identify and fix technical issues, and protect the site and API from abuse through Cloudflare and Arcjet security services.",
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
          description:"Protect against fraud, abuse, and security threats, including verifying email addresses submitted through Contact, Get Listed, Quick Contact, and listing reports; verifying changed listing phone numbers or emails on claimed listings; and reviewing disputed or fraudulent business claims.",
        },
        {
          label: "Legal Proceedings:",
          description:"Respond to legal requests, court orders, or law enforcement.",
        },
      ],
    },
  ];

  const serviceProviderBulletPoints = [
    {
      label: "Web hosting, application infrastructure, and database storage (Supabase, Vercel)",
    },
    {
      label: "Content delivery, DNS, images, and edge security (Cloudflare)",
    },
    {
      label: "API bot protection and rate limiting (Arcjet)",
    },
    {
      label: "Website analytics (Google Analytics, PostHog)",
    },
    {
      label: "Transactional email delivery (Resend)",
    },
    {
      label: "Email and phone verification (Abstract API)",
    },
    {
      label: "Payment and subscription processing for Featured listings (Stripe)",
    },
    {
      label: "Affiliate product referrals (Amazon Associates)",
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
      description:"Access controls are used to restrict access to your personal information to only those who need to know it to perform their job functions.",
    },
    {
      label: "Regular Updates:",
      description: "Keep security software and systems up to date.",
    },
    {
      label: "Monitoring:",
      description:"Regular monitoring for security threats and vulnerabilities.",
    },
    {
      label: "Incident Response:",
      description:"Procedures for responding to data breaches or security incidents.",
    },
  ];

  const dataRetentionBulletPoints = [
    {
      label: "Contact Inquiries:",
      description:"General Contact, Get Listed, and Quick Contact submissions are retained for up to 3 years after resolution or last related activity.",
    },
    {
      label: "Business Claims:",
      description:"Claim-request records and related verification metadata are retained for up to 3 years after the claim is completed, expired, failed, cancelled, or otherwise closed.",
    },
    {
      label: "Listing Reports:",
      description:"Report Info submissions are retained for up to 3 years after resolution or last related activity.",
    },
    {
      label: "Site Feedback Surveys:",
      description:"Optional post-submit survey responses are retained for up to 2 years for product improvement, after which they may be deleted or aggregated.",
    },
    {
      label: "Account Information:",
      description:"Account credentials and ownership records are retained while your account remains active. If you delete your account, we remove or anonymize account credentials and clear ownership links on affected listings, except where we must retain limited records for security, dispute resolution, tax, accounting, or legal obligations. Deleting your account cancels any active Featured subscription in Stripe; related Featured billing records we store may still be retained as described under Featured Listing Billing Records.",
    },
    {
      label: "Featured Listing Billing Records:",
      description:"Subscription records linked to Featured upgrades (including Stripe identifiers and status history we store) are retained while the subscription is active and for up to 7 years after it ends, or longer if required for tax, accounting, chargeback, or legal obligations. This may include records that remain after you unclaim a listing or delete your account. Payment card details are retained by Stripe under Stripe's policies, not in our card vault.",
    },
    {
      label: "Business Listings:",
      description:"Retained while the business remains listed and for 1 year after removal.",
    },
    {
      label: "Usage Analytics:",
      description:"Aggregated data may be retained indefinitely; individual data retained for up to 2 years.",
    },
    {
      label: "Legal Requirements:",
      description:"Some information may be retained longer to comply with legal obligations.",
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
          label:"Request a copy of your personal information in a portable format",
        },
      ],
    },
    {
      title: "Correction and Updates:",
      bulletPoints: [
        {
          label:"Request correction of inaccurate or incomplete personal information",
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
          label:"Request deletion of your personal information, subject to legal requirements",
        },
        {
          label:"Request deletion of optional site feedback survey responses you submitted",
        },
      ],
    },
    {
      title: "Objection and Restriction:",
      bulletPoints: [
        {
          label: "Object to certain uses of your personal information",
        },
        {
          label:"Limit analytics tracking through your browser's privacy settings, cookie controls, or ad-blocking extensions",
        },
      ],
    },
    {
      title: "Withdraw Consent:",
      bulletPoints: [
        {
          label:"Withdraw consent for data processing where consent is the legal basis",
        },
      ],
    },
  ];

  const paragraphSections = [
    {
      title: "Children's Privacy",
      content:"Our Service is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.",
    },
    {
      title: "Third-Party Links and Services",
      content:"Our directory, blog, and Shop pages contain links to third-party websites, businesses, and retailers (including Amazon). This Privacy Policy does not apply to those third-party sites or services. We are not responsible for the privacy practices or content of third-party websites. We encourage you to review the privacy policies of any third-party sites you visit. For third-party services we use to operate our website (such as Google Analytics, PostHog, Cloudflare, Arcjet, Resend, Supabase, Abstract API, Stripe, and Amazon Associates), see the Third-Party Services section above.",
    },
    {
      title: "International Data Transfers",
      content:"If you are located outside the United States, please note that we may transfer your information to and process it in the United States, where our servers are located and our service providers operate. By using our Service, you consent to such transfers.",
    },
  ];

  const californiaPrivacyRightsBulletPoints = [
    {
      label: "Right to Know:",
      description:"What personal information we collect, use, disclose, and sell.",
    },
    {
      label: "Right to Delete:",
      description: "Request deletion of personal information.",
    },
    {
      label: "Right to Opt-Out:",
      description:"Opt-out of the sale of personal information (we do not sell personal information).",
    },
    {
      label: "Right to Non-Discrimination:",
      description:"Not be discriminated against for exercising privacy rights.",
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
      label:"Notify users of material changes via email (if we have your email address) or prominent website notice",
    },
    {
      label:"For significant changes, provide 30 days' notice before the changes take effect",
    },
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Privacy", url: "/privacy" },
  ];

  const pageTitle = "Privacy Policy";
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
          <h2 className="text-3xl font-heading font-bold mt-6">Introduction</h2>
          <p className="mt-4 text-foreground leading-relaxed">
            RadiatorRepairHub (&quot;we,&quot; &quot;our,&quot; &quot;us,&quot;
            or &quot;Company&quot;) operates the website {process.env.WEB_URL}{" "}
            (the &quot;Service&quot;), which provides a directory of radiator
            repair businesses, related educational content, and Tools &amp;
            Supplies product recommendations. We are committed to protecting
            your privacy and handling your personal information responsibly.
          </p>
          <p className="mt-4 text-foreground leading-relaxed">
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or use our
            services. Please read this policy carefully. By accessing or using
            our Service, you consent to the data practices described in this
            policy.
          </p>
          <p className="mt-4 text-foreground leading-relaxed">
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
              <ul className="mt-2 text-foreground">
                {item.bulletPoints.map((bulletPoint) => (
                  <li
                    className="flex flex-col gap-1 mb-4 ml-6"
                    key={"privacy-policy-information-collected-" +
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
            Third-Party Services
          </h2>
          <p className="mt-4 text-foreground leading-relaxed">
            We use the following third-party services to operate, secure, and
            improve our website. These providers may collect and process
            information about your visit as described below. We do not control
            how these third parties use your data; please review their privacy
            policies for more information.
          </p>

          {thirdPartyServicesContent.map((item) => (
            <React.Fragment
              key={`privacy-policy-third-party-services-${item.title}`}
            >
              <h3 className="text-xl font-heading font-semibold mt-8 mb-4">
                {item.title}
              </h3>
              <ul className="mt-2 text-foreground">
                {item.bulletPoints.map((bulletPoint) => (
                  <li
                    className="flex flex-col gap-1 mb-4 ml-6"
                    key={"privacy-policy-third-party-services-" +
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
          <p className="mt-2 text-foreground">
            We use the collected information for the following purposes:
          </p>

          {howWeUseYourInformationContent.map((item) => (
            <React.Fragment
              key={`privacy-policy-how-we-use-your-information-${item.title}`}
            >
              <h3 className="text-xl font-heading font-semibold mt-8 mb-4">
                {item.title}
              </h3>
              <ul className="mt-2 text-foreground">
                {item.bulletPoints.map((bulletPoint) => (
                  <li
                    className="flex flex-col gap-1 mb-4 ml-6"
                    key={"privacy-policy-how-we-use-your-information-" +
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
          <p className="mt-2 text-foreground">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information only in the following limited
            circumstances:
          </p>

          {/* Service Providers */}
          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Service Providers
          </h3>
          <p className="mt-2 text-foreground">
            We may share information with third-party service providers who
            assist us in:
          </p>

          <ul className="mt-4 text-foreground space-y-2">
            {serviceProviderBulletPoints.map((bulletPoint) => (
              <li
                className="mb-4 ml-6"
                key={`privacy-policy-service-provider-${bulletPoint.label}`}
              >
                • {bulletPoint.label}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-foreground">
            These providers are contractually bound to protect your information
            and use it only for specified services.
          </p>

          {/* Business Transfers */}
          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Business Transfers
          </h3>
          <p className="mt-2 text-foreground">
            If we are involved in a merger, acquisition, or sale of assets, your
            information may be transferred as part of that transaction. We will
            provide notice before your information is transferred and becomes
            subject to a different privacy policy.
          </p>

          {/* Legal Requirements */}
          <h3 className="text-xl font-heading font-semibold mt-6 mb-4">
            Legal Requirements
          </h3>
          <p className="mt-2 text-foreground">
            We may disclose your information when required by law, including:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground">
            We may share information with your explicit consent or at your
            direction.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Data Security
          </h2>
          <p className="mt-2 text-foreground">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. These measures
            include:
          </p>
          <ul className="mt-4 text-foreground">
            {securityMeasuresBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={"privacy-policy-data-security-" + bulletPoint.label}
              >
                <strong>• {bulletPoint.label}</strong> {bulletPoint.description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-foreground">
            However, no internet transmission or electronic storage is 100%
            secure. While we strive to protect your information, we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Data Retention
          </h2>
          <p className="mt-2 text-foreground">
            We retain personal information only for as long as necessary to
            fulfill the purposes outlined in this policy or as required by law:
          </p>
          <ul className="mt-4 text-foreground">
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
          <p className="mt-2 text-foreground">
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
              <ul className="mt-2 text-foreground">
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

          <p className="mt-2 text-foreground">
            To exercise these rights, contact us
            {businessEmail ? (
              <>
                {" "}
                at{" "}
                <a
                  href={`mailto:${businessEmail}`}
                  className="text-interactive underline transition-colors hover:text-interactive/80"
                >
                  {businessEmail}
                </a>
              </>
            ) : null}{" "}
            (email, phone, or SMS — see Contact Information below). We will
            respond to your request within 30 days.
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
            <p className="mt-2 text-foreground leading-relaxed">{item.content}</p>
          </section>
        ))}

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            California Privacy Rights (CCPA)
          </h2>
          <p className="mt-2 text-foreground">
            If you are a California resident, you have additional rights under
            the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="mt-4 text-foreground space-y-2">
            {californiaPrivacyRightsBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={`privacy-policy-california-privacy-rights-${bulletPoint.label}`}
              >
                <strong>• {bulletPoint.label}</strong> {bulletPoint.description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-foreground">
            To exercise these rights, contact us
            {businessEmail ? (
              <>
                {" "}
                at{" "}
                <a
                  href={`mailto:${businessEmail}`}
                  className="text-interactive underline transition-colors hover:text-interactive/80"
                >
                  {businessEmail}
                </a>
              </>
            ) : null}{" "}
            (email, phone, or SMS — see Contact Information below). We will
            respond to your request within 30 days.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            European Union Users (GDPR)
          </h2>
          <p className="mt-2 text-foreground">
            If you are located in the European Union, you have rights under the
            General Data Protection Regulation (GDPR), including those listed in
            the &quot;Your Privacy Rights&quot; section above. Our lawful bases
            for processing your information include:
          </p>
          <ul className="mt-4 text-foreground space-y-2">
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
          <p className="mt-2 text-foreground">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices, technology, legal requirements, or other
            factors. When we make changes, we will:
          </p>

          <ul className="mt-4 text-foreground space-y-2">
            {changesToThisPrivacyPolicyBulletPoints.map((bulletPoint) => (
              <li
                className="flex flex-col gap-1 mb-4 ml-6"
                key={`privacy-policy-changes-to-this-privacy-policy-${bulletPoint.label}`}
              >
                • {bulletPoint.label}
              </li>
            ))}
          </ul>

          <p className="mt-2 text-foreground">
            We encourage you to review this Privacy Policy periodically to stay
            informed about how we protect your information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold mt-6">
            Contact Information
          </h2>
          <p className="mt-4 text-foreground">
            If you have questions, concerns, or requests regarding this Privacy
            Policy or our data practices, please contact us:
          </p>
          <SiteSupportContactLines />
          <p className="mt-6 text-foreground">
            We will try to respond to inquiries within 30 days of receipt.
          </p>
        </section>

        <p className="mb-12 text-muted-foreground font-bold italic text-center mx-auto leading-relaxed">
          By using RadiatorRepairHub, you acknowledge that you have read and
          understood this Privacy Policy and agree to our data practices as
          described herein.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
