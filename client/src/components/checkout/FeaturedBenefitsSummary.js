import { FEATURED_BENEFITS } from "@/lib/featuredBenefits";

export default function FeaturedBenefitsSummary({
  heading = "What Featured includes",
}) {
  return (
    <section aria-labelledby="featured-benefits-heading">
      <h2
        id="featured-benefits-heading"
        className="mb-3 font-heading text-lg font-semibold text-foreground"
      >
        {heading}
      </h2>
      <ul className="space-y-3">
        {FEATURED_BENEFITS.map(({ title, description, icon: Icon }) => (
          <li key={title} className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted-foreground/10">
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
