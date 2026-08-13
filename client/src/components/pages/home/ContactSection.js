import React from "react";
import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { getBusinessEmail, getBusinessPhoneDigits } from "@/lib/businessContactInfo";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";

function ContactSection() {
  const email = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());

  return (
    <section className="mb-16 bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Get In Touch
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Questions about the RadiatorRepairHub directory, listings, or
            partnerships? Contact our team. To reach a repair shop, use Quick
            Contact on their business page.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {(email || hasPhone) && (
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {email ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-tint">
                    <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                    Email Us
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Send us a message anytime. We typically respond within 24
                    hours
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="break-all text-interactive transition-colors duration-200 hover:text-primary"
                  >
                    {email}
                  </a>
                </div>
              ) : null}

              {hasPhone ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-tint">
                    <Phone
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                    Call or Text Us
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Phone and SMS for directory support
                  </p>
                  <SitePhoneLinks
                    showLabel={false}
                    linkClassName="text-interactive transition-colors duration-200 hover:text-primary"
                  />
                </div>
              ) : null}
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h3 className="mb-4 font-heading text-2xl font-semibold text-foreground">
              Have a Question?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl leading-relaxed text-muted-foreground">
              <strong>Directory support</strong>, listing questions,{" "}
              <strong>partnerships</strong>, or website feedback? Message the
              RadiatorRepairHub team. Want your shop in the directory?{" "}
              <strong>Get listed</strong> for free. Need a repair shop? Contact
              them from their business page.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 md:w-auto"
              >
                <span>Contact Us</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/get-listed"
                className="inline-flex items-center font-medium text-interactive transition-colors duration-200 hover:text-primary"
              >
                <span>Get Listed</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
