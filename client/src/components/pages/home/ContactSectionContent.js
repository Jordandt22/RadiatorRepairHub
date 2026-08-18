"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

import AnimatedStaggerGrid, {
  AnimatedStaggerItem,
} from "@/components/ui/AnimatedStaggerGrid";
import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";

export default function ContactSectionContent({
  email,
  phoneDisplay,
  phoneSmsHref,
}) {
  const { ref, inView, reduceMotion } = useHomeSectionInView();
  const hasPhone = Boolean(phoneDisplay && phoneSmsHref);

  return (
    <section ref={ref} className="mb-16 bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion)}
        >
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Get In Touch
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Questions about the RadiatorRepairHub directory, listings, or
            partnerships? Contact our team. To reach a repair shop, use Quick
            Contact on their business page.
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl">
          {email || hasPhone ? (
            <AnimatedStaggerGrid
              inView={inView}
              reduceMotion={reduceMotion}
              className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
            >
              {email ? (
                <AnimatedStaggerItem reduceMotion={reduceMotion} className="h-full">
                  <div className="h-full rounded-lg border border-border bg-card p-6">
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-tint">
                      <Mail
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
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
                </AnimatedStaggerItem>
              ) : null}

              {hasPhone ? (
                <AnimatedStaggerItem reduceMotion={reduceMotion} className="h-full">
                  <div className="h-full rounded-lg border border-border bg-card p-6">
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-tint">
                      <Phone
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                      Text Us
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Text only for directory support
                    </p>
                    <a
                      href={phoneSmsHref}
                      className="text-interactive transition-colors duration-200 hover:text-primary"
                    >
                      {phoneDisplay}
                    </a>
                  </div>
                </AnimatedStaggerItem>
              ) : null}
            </AnimatedStaggerGrid>
          ) : null}

          <motion.div
            className="rounded-lg border border-border bg-card p-8 text-center"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn(reduceMotion, 0.16)}
          >
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
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90 md:w-auto"
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
