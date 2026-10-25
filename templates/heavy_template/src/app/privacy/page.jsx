import { BreadcrumbJsonLd } from "@/components/layout/JsonLd";
import { LegalContact } from "@/components/pages/shared/LegalContact";
import { PageCta } from "@/components/pages/shared/PageCta";
import { getConfig } from "@/lib/config";
import { mapsEmbedSrc } from "@/lib/maps";
import { CHROME } from "@/lib/chrome";
import { routeMetadata } from "@/lib/seo";
import { h1, muted, section, wrap } from "@/lib/ui";

export function generateMetadata() {
  return routeMetadata(getConfig(), "privacy", "/privacy");
}

const h2 = "mt-8 mb-2 text-xl font-semibold";
const p = "mb-4 leading-relaxed";

export default function PrivacyPage() {
  const config = getConfig();
  const { shop } = config;
  const hasMap = Boolean(mapsEmbedSrc(config));
  return (
    <>
      <BreadcrumbJsonLd name={CHROME.privacy} path="/privacy" />
      <section className={`${section} lg:min-h-screen`}>
        <div className={wrap}>
          <article className="max-w-2xl">
            <h1 className={h1}>Privacy Policy</h1>
            <p className={`mb-6 text-sm ${muted}`}>Last updated: {CHROME.legalUpdated}</p>

            <p className={p}>
              This Privacy Policy describes how {shop.name} (“we,” “us,” or “the shop”) collects,
              uses, and shares information when you visit this website or contact us through it.
              By using this site, you agree to this policy.
            </p>

            <h2 className={h2}>Who we are</h2>
            <p className={p}>
              {shop.name} is a local business located at {shop.address}, {shop.city}, {shop.state}{" "}
              {shop.zip}. This website is provided so you can learn about our services and request
              a quote or callback. RadiatorRepairHub operates the site and the contact form for the
              shop. RadiatorRepairHub is not the repair shop.
            </p>

            <h2 className={h2}>Information we collect</h2>
            <p className={p}>We may collect:</p>
            <ul className="mb-4 list-disc space-y-2 pl-5 leading-relaxed">
              <li>
                <strong>Contact form information</strong> you submit: name, phone number, optional
                email address, the service you need, your vehicle, and a description of the issue.
                The request is stored so the shop can reply, and the shop is emailed a copy.
              </li>
              <li>
                <strong>A confirmation email</strong> when you include an email address. We check
                that the address looks deliverable, then email you that the shop received the
                request. That email can include the shop’s phone, address, and hours.
              </li>
              <li>
                <strong>Review emails</strong> after a visit, when we have your email address. We
                may email you a request to leave a Google review, and we may send one follow-up to
                the same address. We keep the name, email, message, review link, whether the send
                succeeded, and the time.
              </li>
              <li>
                <strong>Technical information</strong> that your browser or device may send in the
                ordinary course of visiting a website (such as IP address, browser type, and pages
                viewed). A short-lived rate-limit record, including the IP address, is kept so the
                form cannot be flooded. We do not use this to build a personal profile of you.
              </li>
            </ul>
            <p className={p}>
              We do not knowingly collect personal information from children under 13. If you
              believe a child has submitted information to us, please contact us and we will delete
              it.
            </p>

            <h2 className={h2}>How we use information</h2>
            <p className={p}>We use information you send us to:</p>
            <ul className="mb-4 list-disc space-y-2 pl-5 leading-relaxed">
              <li>Respond to quote requests, questions, and callbacks</li>
              <li>Send a confirmation when you include an email address</li>
              <li>Schedule or discuss repair work with you</li>
              <li>Ask for a Google review after a visit, including one follow-up</li>
              <li>Operate, secure, and improve this website</li>
              <li>Comply with legal obligations when required</li>
            </ul>
            <p className={p}>
              We do not sell your personal information, and we do not share it with third parties
              for their marketing.
            </p>

            <h2 className={h2}>Sharing and third parties</h2>
            <p className={p}>
              We share information with the services that run this site and deliver messages:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-5 leading-relaxed">
              <li>
                <strong>RadiatorRepairHub</strong> stores the request and sends the confirmation
                and review emails on behalf of {shop.name}.
              </li>
              <li>
                <strong>Resend</strong> delivers those emails.
              </li>
              <li>
                <strong>Abstract API</strong> receives an email address, when you provide one, to
                check that it looks deliverable.
              </li>
              <li>
                <strong>Google</strong> provides the map on this site and the review page linked
                from a review email.
              </li>
            </ul>
            <p className={p}>
              We may also disclose information when the law requires it. These providers process
              information to provide their service. We do not share your information for their
              marketing.
            </p>

            <h2 className={h2}>Review emails</h2>
            <p className={p}>
              A review email is sent only when the shop chooses to send it. It comes from a
              RadiatorRepairHub address with {shop.name} shown as the sender. If the shop has a
              public email address, replies go there. The message includes a Google review link, a
              line stating that RadiatorRepairHub sent it for the shop, and an unsubscribe link.
            </p>
            <p className={p}>
              We do not track whether you open the email or click the review link. Unsubscribing
              stops further review emails from {shop.name} to that address. It does not stop the
              shop from calling you, and it does not block a new form you submit. Other shops are
              not affected.
            </p>
            <p className={p}>
              We send no more than two review emails to the same address in a month, so a request
              can be followed by one follow-up. The month follows the shop’s time zone. A failed
              send does not count. Leaving a review is optional.
            </p>

            <h2 className={h2}>Cookies and tracking</h2>
            <p className={p}>
              This site does not use advertising cookies or third-party analytics. Your browser may
              still store ordinary session or preference data needed for the site to function.
              {hasMap
                ? " If a page includes an embedded map, that map is loaded from Google, and Google may set its own cookies when the map loads."
                : ""}{" "}
              You can control cookies through your browser settings.
            </p>

            <h2 className={h2}>Retention</h2>
            <p className={p}>
              We keep the contact-form request, review-email records, and an unsubscribe record
              for as long as needed to respond to you, complete any work, honor the unsubscribe,
              apply the two-email limit, or meet legal and business record requirements. Short-lived
              rate-limit records expire on their own. We then delete or archive the rest in the
              ordinary course of business.
            </p>

            <h2 className={h2}>Your choices</h2>
            <p className={p}>
              You may contact us to ask what personal information we hold about you from this site,
              to correct inaccurate details, or to request that we delete information we no longer
              need, subject to any legal retention duties. You can unsubscribe from review emails
              with the link in the email. You can also choose not to use the contact form and call
              or email us instead.
            </p>

            <h2 className={h2}>Security</h2>
            <p className={p}>
              We take reasonable steps to protect information you send us. No method of
              transmission over the internet is completely secure, so we cannot guarantee absolute
              security.
            </p>

            <h2 className={h2}>Changes to this policy</h2>
            <p className={p}>
              We may update this Privacy Policy from time to time. The “Last updated” date at the
              top of this page will change when we do. Continued use of the site after a change
              means you accept the updated policy.
            </p>

            <LegalContact />
          </article>
        </div>
      </section>
      <PageCta line={CHROME.ctaContact} heading={CHROME.ctaHeadingContact} />
    </>
  );
}
