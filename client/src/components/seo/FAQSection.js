"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { getRelatedBlogs } from "@/lib/data/faq";

export function FAQItem({ faq, itemKey, isOpen, onToggle, reduceMotion }) {
  const panelId = useId();
  const buttonId = `${panelId}-button`;
  const relatedBlogs = getRelatedBlogs(faq);

  return (
    <div className="border-b border-border bg-background last:border-b-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(itemKey)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-heading text-lg font-semibold text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
        >
          <span>{faq.question}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.25, ease: "easeInOut" }
            }
            className="inline-flex shrink-0"
          >
            <ChevronDown
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={
              reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
            }
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <p className="leading-relaxed text-muted-foreground">{faq.answer}</p>
              {relatedBlogs.length > 0 ? (
                <div className="mt-3 text-sm text-muted-foreground">
                  <span>
                    {relatedBlogs.length === 1 ? "Related guide: " : "Related guides: "}
                  </span>
                  {relatedBlogs.map((blog, index) => (
                    <span key={blog.href}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={blog.href}
                        className="font-medium text-interactive underline hover:text-primary"
                      >
                        {blog.title}
                      </Link>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordion({
  faqs,
  openKey,
  onToggle,
  reduceMotion,
  keyPrefix = "faq",
}) {
  if (!faqs?.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {faqs.map((faq, index) => {
        const itemKey = `${keyPrefix}-${faq.id ?? index}`;
        return (
          <FAQItem
            key={itemKey}
            faq={faq}
            itemKey={itemKey}
            isOpen={openKey === itemKey}
            onToggle={onToggle}
            reduceMotion={reduceMotion}
          />
        );
      })}
    </div>
  );
}

function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
  description = "Get answers to common questions about radiator repair services",
  includeSchema = true,
}) {
  const [openKey, setOpenKey] = useState(null);
  const reduceMotion = useReducedMotion();

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const handleToggle = (key) => {
    setOpenKey((current) => (current === key ? null : key));
  };

  return (
    <>
      {includeSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      ) : null}

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="text-base text-muted-foreground md:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          <FAQAccordion
            faqs={faqs}
            openKey={openKey}
            onToggle={handleToggle}
            reduceMotion={Boolean(reduceMotion)}
          />
        </div>
      </section>
    </>
  );
}

export default FAQSection;
