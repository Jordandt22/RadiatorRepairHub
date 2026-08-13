import React from "react";
import Link from "next/link";
import {
  formatBusinessPhoneDisplay,
  getBusinessPhoneSmsHref,
  getBusinessPhoneTelHref,
} from "@/lib/businessContactInfo";

function Footer({ businessEmail = null, businessPhoneDigits = null }) {
  const discoverLinks = [
    { label: "Home", path: "/" },
    { label: "Featured", path: "/featured" },
    { label: "Categories", path: "/categories" },
    { label: "Find a Shop", path: "/search" },
    { label: "States", path: "/states" },
  ];

  const aboutLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "About", path: "/about" },
    { label: "Blogs", path: "/blogs" },
    { label: "Tools & Supplies", path: "/shop" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
    { label: "Get Listed", path: "/get-listed" },
    { label: "How to Claim", path: "/how-to-claim" },
  ];

  const topStates = [
    { label: "California", path: "/state/CA" },
    { label: "Texas", path: "/state/TX" },
    { label: "Florida", path: "/state/FL" },
    { label: "New York", path: "/state/NY" },
    { label: "Washington", path: "/state/WA" },
  ];

  const email = businessEmail;
  const phoneDigits = businessPhoneDigits;
  const phoneDisplay = formatBusinessPhoneDisplay(phoneDigits);
  const telHref = getBusinessPhoneTelHref(phoneDigits);
  const smsHref = getBusinessPhoneSmsHref(phoneDigits);

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Branding & Tagline */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 font-heading">
              RadiatorRepairHub
            </h3>
            <p className="text-white/60 mb-4 italic">
              Your trusted radiator repair directory.
            </p>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-4">
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
                      className="text-white/70 hover:text-white transition-colors break-all"
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
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {phoneDisplay}
                    </a>
                    <span className="text-white/30 mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <a
                      href={smsHref}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      SMS
                    </a>
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">
              Discover
            </h4>
            <ul className="space-y-2">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">
              Top States
            </h4>
            <ul className="space-y-2">
              {topStates.map((state) => (
                <li key={state.label}>
                  <Link
                    href={state.path}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {state.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">About</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 mb-4 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} RadiatorRepairHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
