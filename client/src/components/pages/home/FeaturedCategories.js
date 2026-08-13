import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function FeaturedCategories() {
  // Featured primary categories
  const featuredPrimaryCategories = [
    {
      id: "126c620b-bb78-4ae0-b4f6-4e68ae835f96",
      name: "Auto repair shop",
      slug: "auto-repair-shop",
    },
    {
      id: "e8ee0fde-3bad-4bf5-8d03-c4cd127757cc",
      name: "Radiator repair service",
      slug: "radiator-repair-service",
    },
    {
      id: "2fcfeb02-e175-40d4-a2e1-92fdb8a73fdc",
      name: "Radiator shop",
      slug: "radiator-shop",
    },
    {
      id: "e001a483-5d97-4684-b815-8ff6a3ddd123",
      name: "Auto body shop",
      slug: "auto-body-shop",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
            Featured Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the most common radiator repair services available through
            our verified network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPrimaryCategories.map((category) => (
            <Link
              key={category.id}
              className="group bg-card rounded-lg border border-border p-6 hover:border-interactive/50 transition-colors duration-200"
              href={`/category/${category.slug}`}
            >
              <h3 className="text-lg font-semibold text-foreground mb-2 font-heading capitalize">
                {category.name}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Professional {category.name.toLowerCase()} services from
                verified specialists
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive group-hover:text-primary transition-colors">
                Browse shops
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;
