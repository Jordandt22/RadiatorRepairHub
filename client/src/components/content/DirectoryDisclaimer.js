import React from "react";
import Link from "next/link";

function DirectoryDisclaimer({ className = "mt-12" }) {
  return (
    <section className={className} aria-label="Directory disclaimer">
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="mb-4 leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Please note:</strong>{" "}
          RadiatorRepairHub is a business directory only. We do not provide
          radiator repair services, estimates, or appointments.
        </p>
        <p className="mb-3 leading-relaxed text-muted-foreground">
          If you need actual service, please:
        </p>
        <ul className="mb-4 ml-2 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <Link
              href="/search?page=1&sort=most_reviews"
              className="font-medium text-interactive underline hover:text-primary"
            >
              Use our search
            </Link>{" "}
            to find shops near you
          </li>
          <li>
            Contact the business directly using their listed contact information
          </li>
        </ul>
        <p className="leading-relaxed text-muted-foreground">
          Contact us if you need help finding shops near you.
        </p>
      </div>
    </section>
  );
}

export default DirectoryDisclaimer;
