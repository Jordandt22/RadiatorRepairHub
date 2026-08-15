import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  MapPinned,
  Search,
  Star,
  ExternalLink,
  Tags,
} from "lucide-react";

// Components
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessHeroBanner from "@/components/businesses/BusinessHeroBanner";
import BusinessHeroActions from "@/components/businesses/BusinessHeroActions";
import ClaimBusinessButton from "@/components/businesses/ClaimBusinessButton";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import ContactInformationSection from "@/components/businesses/ContactInformationSection";
import ServiceCategoriesSection from "@/components/businesses/ServiceCategoriesSection";
import AmenitiesSection from "@/components/businesses/AmenitiesSection";
import AboutSection from "@/components/businesses/AboutSection";
import BusinessHoursSection from "@/components/businesses/BusinessHoursSection";
import VerifiedBadge from "@/components/businesses/VerifiedBadge";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import {
  DEFAULT_OG_IMAGE,
  NOINDEX_ROBOTS,
  INDEX_ROBOTS,
} from "@/lib/seo/metadata";
import { fetchBusinessBySlug } from "@/lib/api/businesses";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import { getBusinessDisplayImage } from "@/lib/images";

function getGoogleMapsQuery(business) {
  if (business.place_id) {
    return `place_id:${business.place_id}`;
  }

  if (business.latitude != null && business.longitude != null) {
    return `${business.latitude},${business.longitude}`;
  }

  if (business.address) {
    return business.address;
  }

  return null;
}

// Generate metadata for business pages
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const { data: business, error } = await fetchBusinessBySlug(slug);

    if (error || !business) {
      return {
        title: "Business Not Found - RadiatorRepairHub",
        description: "The requested business could not be found.",
        robots: NOINDEX_ROBOTS,
      };
    }

    const title = `Radiator Repair: ${business.title_tag} | ${business.city.name}, ${business.state.name} - RadiatorRepairHub`;
    const description = `Expert radiator repair services at ${business.title
      } in ${business.city.name}, ${business.state.name}. ${business.meta_description ||
      business.local_note ||
      "Professional radiator repair and cooling system services for your vehicle."
      } ${business.phone
        ? `Call ${business.phone} for radiator repair today!`
        : "Contact us for quality radiator repair."
      }`;
    const displayImage = getBusinessDisplayImage(business);

    return {
      title,
      description,
      keywords: business.keywords
        ? `${business.keywords.join(", ")}, radiator repair, ${business.title
        }, ${business.city.name}, ${business.state.name}`
        : `${business.title}, radiator repair, ${business.city.name}, ${business.state.name
        }, auto repair, cooling system repair, ${business.primary_category?.name || "automotive services"
        }`,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "en_US",
        images: displayImage
          ? [
            {
              url: displayImage,
              width: 1200,
              height: 630,
              alt: business.title,
            },
          ]
          : [DEFAULT_OG_IMAGE],
        siteName: "RadiatorRepairHub",
      },
      alternates: {
        canonical: `https://radiatorrepairhub.com/business/${slug}`,
      },
      robots: INDEX_ROBOTS,
    };
  } catch {
    return {
      title: "Business Not Found - RadiatorRepairHub",
      description: "The requested business could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }
}

async function Page({ params }) {
  const { slug } = await params;

  try {
    const { data: business, error, status } = await fetchBusinessBySlug(slug);

    if (error) {
      return (
        <ErrorDisplay
          status={status || 500}
          code={error?.code}
          message={error?.message || "Unable to load business details."}
        />
      );
    }

    if (!business) {
      return notFound();
    }

    const featuredProducts = business.is_claimed
      ? []
      : (
        await fetchActiveAffiliateProductsByAliases([
          "valvoline",
          "radiator-cap",
          "coolant-funnel",
        ])
      ).data?.products ?? [];

    const mapsQuery = getGoogleMapsQuery(business);

    // Generate structured data for LocalBusiness
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `https://radiatorrepairhub.com/business/${slug}`,
      name: business.title_tag,
      description: business.meta_description,
      url: business.website || `https://radiatorrepairhub.com/business/${slug}`,
      telephone: business.phone,
      ...(business.keywords &&
        business.keywords.length > 0 && {
        keywords: business.keywords.join(", "),
      }),
      ...(business.highlights &&
        business.highlights.length > 0 && {
        amenityFeature: business.highlights.map((highlight) => ({
          "@type": "LocationFeatureSpecification",
          name: highlight,
          value: true,
        })),
      }),
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: business.city.name,
        addressRegion: business.state.name,
        addressCountry: "US",
      },
      geo:
        business.latitude && business.longitude
          ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          }
          : undefined,
      image: getBusinessDisplayImage(business),
      ...(business.reviews_count > 0 &&
        business.total_score > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: business.total_score,
          reviewCount: business.reviews_count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
      priceRange: "$$",
      openingHoursSpecification: business.hours
        ?.flatMap((day) => {
          // If closed, skip this day
          if (day.is_closed || !day.hours || day.hours.length === 0) {
            return [];
          }

          // Map each time slot to an OpeningHoursSpecification
          return day.hours.map((timeSlot) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: day.day_of_week,
            opens: timeSlot.open,
            closes: timeSlot.close,
          }));
        })
        .filter(Boolean),
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: business.latitude,
          longitude: business.longitude,
        },
        geoRadius: "50000",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Radiator Repair Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: business.primary_category?.name || "Radiator Repair Service",
              description:
                "Professional radiator repair and maintenance services",
            },
          },
        ],
      },
      ...(business.local_note && {
        additionalProperty: {
          "@type": "PropertyValue",
          name: "Local Note",
          value: business.local_note,
        },
      }),
    };

    // Generate breadcrumb items
    const breadcrumbItems = [
      { name: "Home", url: "/" },
      { name: "Categories", url: "/categories" },
      ...(business.primary_category
        ? [
          {
            name: business.primary_category.name,
            url: `/category/${business.primary_category.slug}`,
          },
        ]
        : []),
      {
        name: business.city.name,
        url: `/state/${business.state.code}/city/${business.city.slug}`,
      },
      { name: business.title, url: `/business/${slug}` },
    ];

    const hasHeroImage = Boolean(getBusinessDisplayImage(business));
    const cityHref = `/state/${business.state.code}/city/${business.city.slug}`;
    const stateHref = `/state/${business.state.code}`;
    const categoryHref = business.primary_category
      ? `/category/${business.primary_category.slug}`
      : null;
    const mapsHref = mapsQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
      : null;

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <div className="min-h-screen bg-background pb-24 md:pb-32">
          <BusinessHeroBanner
            src={business.image_url}
            businessId={business.id}
            imageId={business.primary_image_id}
            cdnStored={Boolean(business.cdn_stored)}
            alt={`${business.title} - Radiator Repair Services in ${business.city.name}, ${business.state.name}`}
            top={
              <div className="mx-auto hidden w-full max-w-7xl px-4 pt-6 sm:px-6 md:block md:pt-8 lg:px-8">
                <BreadcrumbList
                  items={breadcrumbItems}
                  navStyles="w-fit max-w-full rounded-lg bg-black/40 p-2 pl-4 pr-6 text-sm backdrop-blur-sm"
                />
              </div>
            }
          >
            <div className="mx-auto w-full max-w-7xl px-4 pb-8 text-white sm:px-6 md:pb-10 lg:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  {business.title}
                </h1>
              </div>

              {business.local_note ? (
                <p className="mt-3 max-w-3xl text-sm italic text-white/80 md:text-base">
                  {business.local_note}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-current text-yellow-400 md:h-5 md:w-5" />
                  <span className="ml-1 text-base font-semibold md:text-lg">
                    {business.total_score}
                  </span>
                </div>
                <span className="mr-2 text-sm text-white/85 md:text-base">
                  ({business.reviews_count.toLocaleString()} reviews)
                </span>
                <OpenStatus hours={business.hours} timezone={business.timezone} />
                {business.is_claimed ? <VerifiedBadge size="md" /> : null}
              </div>

              <div className="hidden md:block">
                <BusinessHeroActions
                  businessId={business.id}
                  businessName={business.title}
                  phone={business.phone}
                  email={business.email}
                  emailStatus={business.email_status}
                  mapsQuery={mapsQuery}
                  placement="hero"
                />
              </div>
            </div>
          </BusinessHeroBanner>

          <BusinessHeroActions
            businessId={business.id}
            businessName={business.title}
            phone={business.phone}
            email={business.email}
            emailStatus={business.email_status}
            mapsQuery={mapsQuery}
            placement="sticky"
          />

          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-8 lg:px-8">
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
              <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-8">
                <AboutSection
                  businessId={business.id}
                  description={business.description || ""}
                  imageUrl={business.image_url}
                  imageId={business.primary_image_id}
                  cdnStored={Boolean(business.cdn_stored)}
                  showImage={!hasHeroImage}
                  imageAlt={`${business.title} - ${business.keywords && business.keywords.length > 0
                      ? business.keywords[0]
                      : "radiator repair services"
                    } in ${business.city.name}, ${business.state.name}`}
                />

                <ServiceCategoriesSection
                  businessId={business.id}
                  primaryCategory={business.primary_category}
                  secondaryCategories={business.secondary_categories || []}
                />

                <div className="order-6 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-3">
                  <BusinessSectionHeader
                    title="Location"
                    titleClassName="text-xl font-semibold tracking-tight text-foreground font-heading md:text-2xl"
                  />
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground md:h-5 md:w-5" />
                      <p className="break-words text-sm text-foreground md:text-base">
                        {business.address}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={cityHref}
                        className="rounded-full bg-tint px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-secondary md:px-5"
                      >
                        Radiator repair in {business.city.name}
                      </Link>
                      <Link
                        href={stateHref}
                        className="rounded-full bg-tint px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-secondary md:px-5"
                      >
                        {business.state.name} services
                      </Link>
                    </div>

                    {mapsQuery ? (
                      <div className="h-64 w-full overflow-hidden rounded-lg md:h-96">
                        {process.env.GOOGLE_MAPS_API_KEY ? (
                          <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(mapsQuery)}`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map showing location of ${business.title}`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted px-6 text-center">
                            <Link
                              href={mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 font-medium text-interactive hover:text-primary"
                            >
                              <MapPin className="h-5 w-5" />
                              View {business.address || business.title} on
                              Google Maps
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {mapsHref ? (
                      <div className="pt-2">
                        <Link
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open in Google Maps
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="contents lg:flex lg:flex-col lg:gap-6">
                <div className="order-2 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-1">
                  <h2 className="mb-3 font-heading text-xl font-semibold tracking-tight text-foreground md:mb-4 md:text-2xl">
                    Customer Reviews
                  </h2>
                  <div className="text-center">
                    <div className="mb-2 flex flex-col items-center justify-center gap-4">
                      <span className="rounded-md bg-muted px-4 py-2 text-3xl font-bold text-foreground">
                        {business.total_score}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${i < Math.floor(business.total_score)
                                ? "fill-current text-yellow-400"
                                : "text-border"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on {business.reviews_count.toLocaleString()}{" "}
                      verified reviews
                      {business.url ? " from Google" : null}.
                    </p>

                    {business.url ? (
                      <Link
                        href={business.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        View all reviews
                        <ExternalLink className="size-4" />
                      </Link>
                    ) : null}

                    <ClaimBusinessButton
                      businessId={business.id}
                      businessSlug={business.slug}
                      businessName={business.title}
                      email={business.email}
                      emailStatus={business.email_status}
                      isClaimed={Boolean(business.is_claimed)}
                      hasDuplicateEmail={Boolean(business.has_duplicate_email)}
                      lastEditedAt={business.last_edited_at}
                    />
                  </div>
                </div>

                <ContactInformationSection
                  businessId={business.id}
                  businessName={business.title}
                  phone={business.phone}
                  email={business.email}
                  website={business.website}
                  emailStatus={business.email_status}
                />

                <BusinessHoursSection
                  businessId={business.id}
                  hours={business.hours || []}
                  timezone={business.timezone}
                />

                <AmenitiesSection
                  businessId={business.id}
                  features={business.features || {}}
                />
              </div>
            </div>

            <section className="mt-10 border-t border-border pt-10">
              <h2 className="mb-4 font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Explore nearby
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Link
                  href={cityHref}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-interactive"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                    <MapPinned className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {business.city.name}
                      </h3>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      More radiator repair shops in this city
                    </p>
                  </div>
                </Link>
                <Link
                  href={stateHref}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-interactive"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                    <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {business.state.name}
                      </h3>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Browse shops across the state
                    </p>
                  </div>
                </Link>
                {categoryHref ? (
                  <Link
                    href={categoryHref}
                    className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-interactive"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                      <Tags className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                          {business.primary_category.name}
                        </h3>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Similar businesses in this category
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/search?page=1&sort=most_reviews"
                    className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-interactive"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                      <Search className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                          Search directory
                        </h3>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Find radiator repair near you
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </section>

            {!business.is_claimed && featuredProducts.length > 0 ? (
              <AffiliateProductsSection
                products={featuredProducts}
                title="Cooling tools & supplies"
                description={`Optional DIY supplies recommended by RadiatorRepairHub. These products are not sold, endorsed, or affiliated with ${business?.title ?? "this business"}.`}
                descriptionVariant="notice"
                disclosure="Product links are RadiatorRepairHub Amazon Associate recommendations. As an Amazon Associate, RadiatorRepairHub earns from qualifying purchases. This shop is not responsible for these products or purchases."
                variant="related"
              />
            ) : null}

            <DirectoryDisclaimer className="mt-10" />
          </div>
        </div>
      </>
    );
  } catch {
    return (
      <ErrorDisplay
        status={500}
        message="Unable to load business details. Please try again later."
      />
    );
  }
}

export default Page;
