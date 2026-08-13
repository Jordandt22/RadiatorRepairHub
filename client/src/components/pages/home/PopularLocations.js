import React from "react";
import { MapPin } from "lucide-react";
import Link from "next/link";

function PopularLocations() {
  const topStates = [
    { name: "California", code: "CA" },
    { name: "Texas", code: "TX" },
    { name: "New York", code: "NY" },
    { name: "Florida", code: "FL" },
    { name: "Washington", code: "WA" },
    { name: "Arizona", code: "AZ" },
  ];

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
            Popular States
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find radiator repair shops in the most searched states across the
            United States
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topStates.map((state) => (
            <Link
              key={state.code}
              href={`/state/${state.code}`}
              className="group flex items-center gap-3 bg-background rounded-lg border border-border p-4 hover:border-interactive/50 transition-colors duration-200"
            >
              <MapPin
                className="w-5 h-5 text-primary shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground font-heading truncate">
                  {state.name}
                </h3>
                <span className="text-sm text-muted-foreground group-hover:text-interactive transition-colors">
                  View shops
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularLocations;
