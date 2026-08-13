import React from "react";
import Link from "next/link";

const FAQSection = ({ faqs, title = "Frequently Asked Questions", includeSchema = true }) => {
  // Generate FAQ structured data
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

  return (
    <>
      {includeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground">
              Get answers to common questions about radiator repair services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-background rounded-lg p-6 border border-border"
              >
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
                {faq.relatedBlog && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Related Blog:{" "}
                    <Link
                      href={faq.relatedBlog.href}
                      className="text-interactive hover:text-primary underline font-medium"
                    >
                      {faq.relatedBlog.title}
                    </Link>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection;
