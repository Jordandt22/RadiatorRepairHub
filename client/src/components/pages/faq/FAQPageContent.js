"use client";

import React, { useMemo, useState } from "react";
import { FAQAccordion } from "@/components/seo/FAQSection";
import { useReducedMotion } from "framer-motion";
import FAQSearch from "./FAQSearch";

function matchesFaq(faq, query) {
  const haystack = [faq.question, faq.answer]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function FAQPageContent({ sections = [], allFaqs = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openKey, setOpenKey] = useState(null);
  const reduceMotion = useReducedMotion();

  const query = searchTerm.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredSections = useMemo(() => {
    if (!isSearching) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        faqs: section.faqs.filter((faq) => matchesFaq(faq, query)),
      }))
      .filter((section) => section.faqs.length > 0);
  }, [sections, query, isSearching]);

  const visibleCount = useMemo(
    () =>
      filteredSections.reduce(
        (total, section) => total + section.faqs.length,
        0
      ),
    [filteredSections]
  );

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

      <section className="border-b border-border bg-card py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
              Radiator Repair Questions & Answers
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Browse by topic or search for a specific question.
            </p>
          </div>

          <p className="mb-6 text-center text-sm text-muted-foreground">
            <span className="font-semibold text-green-700">
              {visibleCount.toLocaleString()}
            </span>{" "}
            {visibleCount === 1 ? "Question" : "Questions"}
            {isSearching ? ` of ${allFaqs.length.toLocaleString()}` : null}
          </p>

          <div className="mb-8">
            <FAQSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>

          {!isSearching && sections.length > 0 ? (
            <nav
              aria-label="FAQ topics"
              className="mb-10 flex flex-wrap justify-center gap-2"
            >
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex rounded-full border border-primary/20 bg-tint px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:border-interactive hover:bg-tint/80"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          ) : null}

          {isSearching && visibleCount === 0 ? (
            <div className="py-12 text-center">
              <h3 className="mb-2 font-heading text-xl font-bold text-foreground">
                No Questions Found
              </h3>
              <p className="text-muted-foreground">
                No FAQ entries match your search. Try a different term.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-24"
                >
                  <div className="mb-4">
                    <h3
                      id={`${section.id}-heading`}
                      className="font-heading text-xl font-semibold text-foreground md:text-2xl"
                    >
                      {section.title}
                    </h3>
                    {section.description ? (
                      <p className="mt-1 text-sm text-muted-foreground md:text-base">
                        {section.description}
                      </p>
                    ) : null}
                  </div>
                  <FAQAccordion
                    faqs={section.faqs}
                    openKey={openKey}
                    onToggle={handleToggle}
                    reduceMotion={Boolean(reduceMotion)}
                    keyPrefix={section.id}
                  />
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default FAQPageContent;
