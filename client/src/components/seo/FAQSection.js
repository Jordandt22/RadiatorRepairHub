"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

function FAQItem({ faq, index, isOpen, onToggle, reduceMotion }) {
  const panelId = useId();
  const buttonId = `${panelId}-button`;

  return (
    <div className="border-b border-border bg-background last:border-b-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(index)}
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
              {faq.relatedBlog ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Related Blog:{" "}
                  <Link
                    href={faq.relatedBlog.href}
                    className="font-medium text-interactive underline hover:text-primary"
                  >
                    {faq.relatedBlog.title}
                  </Link>
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
  includeSchema = true,
}) {
  const [openIndex, setOpenIndex] = useState(null);
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

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
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
            <p className="text-base text-muted-foreground md:text-lg">
              Get answers to common questions about radiator repair services
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={handleToggle}
                reduceMotion={Boolean(reduceMotion)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default FAQSection;
