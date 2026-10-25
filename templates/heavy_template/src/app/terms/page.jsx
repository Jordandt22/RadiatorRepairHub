import { BreadcrumbJsonLd } from "@/components/layout/JsonLd";
import { LegalContact } from "@/components/pages/shared/LegalContact";
import { PageCta } from "@/components/pages/shared/PageCta";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { routeMetadata } from "@/lib/seo";
import { h1, muted, section, wrap } from "@/lib/ui";

export function generateMetadata() {
  return routeMetadata(getConfig(), "terms", "/terms");
}

const h2 = "mt-8 mb-2 text-xl font-semibold";
const p = "mb-4 leading-relaxed";

export default function TermsPage() {
  const { shop } = getConfig();
  return (
    <>
      <BreadcrumbJsonLd name={CHROME.terms} path="/terms" />
      <section className={`${section} lg:min-h-screen`}>
        <div className={wrap}>
          <article className="max-w-2xl">
            <h1 className={h1}>Terms of Use</h1>
            <p className={`mb-6 text-sm ${muted}`}>Last updated: {CHROME.legalUpdated}</p>

            <p className={p}>
              These Terms of Use (“Terms”) govern your access to and use of this website operated
              for {shop.name} (“we,” “us,” or “the shop”). By using this site, you agree to these
              Terms. If you do not agree, do not use the site.
            </p>

            <h2 className={h2}>About this site</h2>
            <p className={p}>
              This website provides general information about {shop.name}, our services, location,
              and how to request a quote or contact us. Content is for informational purposes and
              may change without notice. Nothing on this site is a binding offer, price quote, or
              guarantee of availability until we confirm it with you directly.
            </p>

            <h2 className={h2}>Quotes, repairs, and your agreement with the shop</h2>
            <p className={p}>
              Any quote, diagnosis, repair work, warranty, payment terms, or other agreement about
              services is solely between you and {shop.name}. Submitting a form on this site does
              not create a contract for work. Estimates given by phone, email, or in person may
              change if additional issues are found after inspection.
            </p>
            <p className={p}>
              RadiatorRepairHub hosts this website and operates the contact form. It is not the
              repair shop and is not a party to any work agreement between you and {shop.name}.
            </p>

            <h2 className={h2}>Messages and review emails</h2>
            <p className={p}>
              Submitting the form sends your request to {shop.name} through RadiatorRepairHub. If
              you include an email address, you may receive a confirmation that the request was
              received. That confirmation is not a quote, an appointment, or a promise that the
              shop can take the job.
            </p>
            <p className={p}>
              After a visit, {shop.name} may email you a request to leave a Google review, and may
              send one follow-up to the same address. Those emails are sent by RadiatorRepairHub
              on behalf of the shop. Each one includes an unsubscribe link. We send no more than
              two review emails to the same address in a month. Leaving a review is optional and is
              not a condition of any repair. Google’s terms apply to the review itself.
            </p>

            <h2 className={h2}>Acceptable use</h2>
            <p className={p}>You agree not to:</p>
            <ul className="mb-4 list-disc space-y-2 pl-5 leading-relaxed">
              <li>Use the site for any unlawful purpose</li>
              <li>Submit false, misleading, or abusive information through forms or messages</li>
              <li>Attempt to disrupt, scrape, or gain unauthorized access to the site or its systems</li>
              <li>Use automated means to overload or misuse contact forms</li>
            </ul>
            <p className={p}>
              We may refuse service, block access, or ignore submissions that violate these Terms.
            </p>

            <h2 className={h2}>Intellectual property</h2>
            <p className={p}>
              Text, logos, photos, and other materials on this site are owned by {shop.name} or
              used with permission. You may view and print pages for personal, non-commercial use
              related to contacting the shop. You may not copy, modify, or redistribute site content
              for commercial purposes without our prior written consent.
            </p>

            <h2 className={h2}>Third-party links and tools</h2>
            <p className={p}>
              This site may link to maps, review platforms, or other third-party sites. A review email
              links to Google’s review page. Those sites have their own terms and privacy practices.
              We are not responsible for their content or policies.
            </p>

            <h2 className={h2}>Disclaimer of warranties</h2>
            <p className={p}>
              THE SITE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE FULLEST EXTENT PERMITTED BY
              LAW, {shop.name.toUpperCase()} DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not
              warrant that the site will be uninterrupted, error-free, or free of harmful
              components, or that all content is complete or current.
            </p>

            <h2 className={h2}>Limitation of liability</h2>
            <p className={p}>
              TO THE FULLEST EXTENT PERMITTED BY LAW, {shop.name.toUpperCase()} AND ITS OWNERS,
              EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING
              OUT OF OR RELATED TO YOUR USE OF (OR INABILITY TO USE) THIS WEBSITE.
            </p>
            <p className={p}>
              Our total liability arising from your use of this website will not exceed one hundred
              U.S. dollars (US $100), except where liability cannot be limited under applicable law.
              This limitation applies to website use only and does not limit any remedies you may
              have under a separate written agreement for repair work performed by the shop.
            </p>

            <h2 className={h2}>Indemnity</h2>
            <p className={p}>
              You agree to indemnify and hold harmless {shop.name} and its owners, employees, and
              agents from claims, damages, and expenses (including reasonable attorneys’ fees)
              arising from your misuse of this site or your violation of these Terms.
            </p>

            <h2 className={h2}>Governing law</h2>
            <p className={p}>
              These Terms are governed by the laws of the State of {shop.state}, without regard to
              conflict-of-law rules. Any dispute arising from these Terms or your use of the site
              will be resolved in the state or federal courts located in {shop.state}, and you
              consent to that venue, except where applicable law requires otherwise.
            </p>

            <h2 className={h2}>Changes</h2>
            <p className={p}>
              We may update these Terms from time to time. The “Last updated” date at the top of
              this page will change when we do. Continued use of the site after a change means you
              accept the updated Terms.
            </p>

            <LegalContact />
          </article>
        </div>
      </section>
      <PageCta line={CHROME.ctaContact} heading={CHROME.ctaHeadingContact} />
    </>
  );
}
