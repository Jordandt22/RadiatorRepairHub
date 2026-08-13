import React from "react";
import Link from "next/link";
import { Mail, Phone, Clock, ArrowRight } from "lucide-react";
import { getBusinessEmail, getBusinessPhoneDigits } from "@/lib/businessContactInfo";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";

function ContactSection() {
  const email = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());

  return (
    <section className="py-16 mb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Questions about the RadiatorRepairHub directory, listings, or
            partnerships? Contact our team — to reach a repair shop, use Quick
            Contact on their business page.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 lg:gap-16 mb-12 flex-wrap">
            {email ? (
              <div className="flex items-start gap-4">
                <Mail
                  className="w-6 h-6 text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-foreground">
                    Email Us
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Send us an email anytime
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-interactive hover:text-primary transition-colors duration-200 break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>
            ) : null}

            {hasPhone ? (
              <div className="flex items-start gap-4">
                <Phone
                  className="w-6 h-6 text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-foreground">
                    Call or Text Us
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Phone and SMS for directory support
                  </p>
                  <SitePhoneLinks showLabel={false} />
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-4">
              <Clock
                className="w-6 h-6 text-primary shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-foreground">
                  Quick Response
                </h3>
                <p className="text-muted-foreground text-sm">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-card rounded-lg p-8 border border-border">
              <h3 className="text-2xl font-semibold mb-4 font-heading text-foreground">
                Have a Question?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                <strong>Directory support</strong>, listing questions,{" "}
                <strong>partnerships</strong>, or website feedback? Message the
                RadiatorRepairHub team. Want your shop in the directory?{" "}
                <strong>Get listed</strong> for free. Need a repair shop?
                Contact them from their business page.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="w-full md:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Link>
                <Link
                  href="/get-listed"
                  className="inline-flex items-center text-interactive font-medium hover:text-primary transition-colors duration-200"
                >
                  <span>Get Listed</span>
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
