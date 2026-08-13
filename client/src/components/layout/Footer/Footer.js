import React from "react";
import Link from "next/link";
import {
  formatBusinessPhoneDisplay,
  getBusinessPhoneSmsHref,
  getBusinessPhoneTelHref,
} from "@/lib/businessContactInfo";

const FALLBACK_TOP_STATES = [
  { label: "California", path: "/state/CA" },
  { label: "Texas", path: "/state/TX" },
  { label: "Florida", path: "/state/FL" },
  { label: "New York", path: "/state/NY" },
  { label: "Illinois", path: "/state/IL" },
];

function Footer({
  businessEmail = null,
  businessPhoneDigits = null,
  topStates = null,
}) {
  const browseLinks = [
    { label: "Featured", path: "/featured" },
    { label: "Categories", path: "/categories" },
    { label: "States", path: "/states" },
    { label: "Find a Shop", path: "/search?page=1&sort=most_reviews" },
  ];

  const resourceLinks = [
    { label: "Blogs", path: "/blogs" },
    { label: "Tools & Supplies", path: "/shop" },
    { label: "How to Claim", path: "/how-to-claim" },
    { label: "FAQ", path: "/faq" },
  ];

  const companyLinks = [
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Get Listed", path: "/get-listed" },
  ];

  const stateLinks =
    Array.isArray(topStates) && topStates.length > 0
      ? topStates.map((state) => ({
          label: state.name || state.label,
          path: `/state/${state.code}`,
        }))
      : FALLBACK_TOP_STATES;

  const email = businessEmail;
  const phoneDigits = businessPhoneDigits;
  const phoneDisplay = formatBusinessPhoneDisplay(phoneDigits);
  const telHref = getBusinessPhoneTelHref(phoneDigits);
  const smsHref = getBusinessPhoneSmsHref(phoneDigits);

  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="mb-4 font-heading text-2xl font-bold tracking-tight">
              RadiatorRepairHub
            </h3>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-white/60">
              Browse radiator repair shops by state and city. Find reliable
              services near you with reviews, hours, and contact details.
            </p>
            {(email || phoneDigits) && (
              <div className="space-y-1.5 text-sm">
                {email ? (
                  <p>
                    <span className="text-white/40">Email: </span>
                    <a
                      href={`mailto:${email}`}
                      className="break-all text-white/70 transition-colors hover:text-white"
                    >
                      {email}
                    </a>
                  </p>
                ) : null}
                {phoneDigits ? (
                  <p>
                    <span className="text-white/40">Call or Text: </span>
                    <a
                      href={telHref}
                      className="text-white/70 transition-colors hover:text-white"
                    >
                      {phoneDisplay}
                    </a>
                    <span className="mx-1.5 text-white/30" aria-hidden="true">
                      ·
                    </span>
                    <a
                      href={smsHref}
                      className="text-white/70 transition-colors hover:text-white"
                    >
                      SMS
                    </a>
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">Browse</h4>
            <ul className="space-y-2">
              {browseLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-base font-semibold">
              Top States
            </h4>
            <ul className="space-y-2">
              {stateLinks.map((state) => (
                <li key={state.path}>
                  <Link
                    href={state.path}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {state.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} RadiatorRepairHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-white/60 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/60 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
