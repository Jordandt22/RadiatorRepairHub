import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  ExternalLink,
  CalendarDays,
  CreditCard,
  Wrench,
  Nfc,
  Car,
  Store,
  Toilet,
  Accessibility,
} from "lucide-react";

// Components
import OpenStatus from "@/components/businesses/status/OpenStatus";
import BusinessImage from "@/components/businesses/BusinessImage";
import BusinessHeroBanner from "@/components/businesses/BusinessHeroBanner";
import QuickContactDialog from "@/components/businesses/QuickContactDialog";
import BusinessContactLinks from "@/components/businesses/BusinessContactLinks";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import {
  DEFAULT_OG_IMAGE,
  NOINDEX_ROBOTS,
  INDEX_ROBOTS,
} from "@/lib/seo/metadata";
import { fetchBusinessBySlug } from "@/lib/api/businesses";

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
      } ${business.cta_line ||
      (business.phone
        ? `Call ${business.phone} for radiator repair today!`
        : "Contact us for quality radiator repair.")
      }`;

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
        images: business.image_url
          ? [
            {
              url: business.image_url,
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

// Feature icons mapping
const featureIcons = {
  appointments_recommended: CalendarDays,
  credit_cards: CreditCard,
  debit_cards: CreditCard,
  mechanic: Wrench,
  nfc_mobile_payments: Nfc,
  oil_change: Car,
  onsite_services: Store,
  restroom: Toilet,
  wheelchair_accessible: Accessibility,
};

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

    // Get available features
    const paymentFeatures = [];
    const accessibilityFeatures = [];
    const otherFeatures = [];
    Object.keys(business.features).forEach((key) => {
      if (business.features[key] === true) {
        switch (key) {
          case "nfc_mobile_payments":
          case "credit_cards":
          case "debit_cards":
            paymentFeatures.push({
              icon: featureIcons[key],
              value:
                key === "nfc_mobile_payments"
                  ? "NFC Mobile Payments"
                  : key.replace(/_/g, " "),
            });
            break;

          case "wheelchair_accessible":
          case "restroom":
            accessibilityFeatures.push({
              icon: featureIcons[key],
              value: key.replace(/_/g, " "),
            });
            break;

          case "oil_change":
          case "onsite_services":
          case "mechanic":
          case "appointments_recommended":
            otherFeatures.push({
              icon: featureIcons[key],
              value: key.replace(/_/g, " "),
            });
            break;

          default:
            break;
        }
      }
    });

    // Format business hours for display (using opening_hours format)
    const formatBusinessHours = (hours) => {
      if (!hours || !Array.isArray(hours)) {
        return <p className="text-sm text-gray-600">Hours not available</p>;
      }

      return (
        <div className="space-y-2">
          {hours.map((day, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{day.day_of_week}</span>
              <div className="text-gray-600 text-right">
                {day.is_closed ? (
                  <span>Closed</span>
                ) : (
                  <div className="space-y-1">
                    <>
                      {
                        day?.hours_text ? (
                          <>
                            {day?.hours_text?.split(",").map((timePeriod, timeIndex) => (
                              <div key={timeIndex} className="text-sm">
                                {timePeriod.trim()}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div key={business.id + " " + day.day_of_week} className="text-sm">
                            Not Available
                          </div>
                        )
                      }
                    </>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

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
      image: business.image_url,
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

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <div className="min-h-screen bg-gray-50 pb-16 md:pb-32">
          {/* Hero Section with Business Image */}
          <BusinessHeroBanner
            src={business.image_url}
            alt={`${business.title} - Radiator Repair Services in ${business.city.name}, ${business.state.name}`}
          >
            <div className="w-full p-3 sm:p-4 md:p-6 text-white max-w-7xl mx-auto hidden md:block">
              <BreadcrumbList
                items={breadcrumbItems}
                navStyles="text-gray-600 mb-4 md:mb-6 bg-slate-900 rounded-lg p-2 pl-4 pr-8 w-fit text-sm"
              />
            </div>

            <div className="w-full p-3 sm:p-4 md:p-6 text-white max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-2 md:mb-4 leading-tight">
                {business.title} - Radiator Repair Services
              </h1>
              {business.local_note && (
                <p className="text-sm md:text-base italic text-gray-200 mb-2 md:mb-4">
                  📍 {business.local_note}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold text-base md:text-lg">
                    {business.total_score}
                  </span>
                </div>
                <span className="text-sm md:text-lg mr-2">
                  ({business.reviews_count.toLocaleString()} reviews)
                </span>
                <OpenStatus hours={business.hours} timezone={business.timezone} />
              </div>
            </div>
          </BusinessHeroBanner>

          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              {/* Main Content — contents on mobile so cards can interleave with sidebar via order */}
              <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-8">
                {/* Description */}
                <div className="order-1 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 font-heading">
                    About Our Business
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {business.description}
                      </p>
                    </div>

                    <div className="relative w-full h-48 md:h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <BusinessImage
                        src={business.image_url}
                        alt={`${business.title} - ${business.keywords && business.keywords.length > 0
                          ? business.keywords[0]
                          : "radiator repair services"
                          } in ${business.city.name}, ${business.state.name}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center"
                        iconSize="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="order-5 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 font-heading">
                    Service Categories
                  </h2>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                        Primary Category
                      </h3>
                      {business.primary_category ? (
                        <Link
                          href={`/category/${business.primary_category.slug}`}
                          className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-500 hover:text-white duration-300 font-medium transition-colors capitalize text-sm md:text-base"
                        >
                          {business.primary_category.name}
                        </Link>
                      ) : (
                        <p className="text-sm md:text-base text-gray-600">None</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                        Secondary Categories
                      </h3>
                      {business.secondary_categories &&
                        business.secondary_categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {business.secondary_categories.map((category) => (
                            <Link
                              href={`/search?secondary_categories=${category.id}`}
                              key={category.id}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 duration-300 hover:scale-95 capitalize"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">None</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="order-6 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 font-heading">
                    Business Location
                  </h2>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-1 flex-shrink-0" />
                      <p className="text-sm md:text-base text-gray-700 break-words">
                        {business.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/state/${business.state.code}/city/${business.city.slug}`}
                        className="text-white bg-blue-600 rounded-full px-4 md:px-6 font-medium py-1 hover:bg-blue-700 duration-300 hover:scale-95 text-sm md:text-base"
                      >
                        Radiator Repair in {business.city.name}
                      </Link>
                      <Link
                        href={`/state/${business.state.code}`}
                        className="text-white bg-blue-600 rounded-full px-4 md:px-6 font-medium py-1 hover:bg-blue-700 duration-300 hover:scale-95 text-sm md:text-base"
                      >
                        {business.state.name} Services
                      </Link>
                    </div>

                    {/* Google Maps Embed */}
                    {business.address && (
                      <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
                        {process.env.GOOGLE_MAPS_API_KEY ? (
                          <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(business.address)}`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map showing location of ${business.title}`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-100 px-6 text-center">
                            <Link
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <MapPin className="w-5 h-5" />
                              View {business.address} on Google Maps
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {business.url && (
                      <div className="pt-4">
                        <Link
                          href={business.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Google Maps
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar — contents on mobile so reviews/contact/hours sit after About */}
              <div className="contents lg:flex lg:flex-col lg:gap-6">
                {/* Rating Summary */}
                <div className="order-2 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 font-heading">
                    Customer Reviews
                  </h2>
                  <div className="text-center">
                    <div className="flex flex-col items-center justify-center gap-4 mb-2">
                      <span className="text-3xl font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-md">
                        {business.total_score}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${i < Math.floor(business.total_score)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Based on {business.reviews_count.toLocaleString()} Verified Reviews
                    </p>

                    {business.url && (
                      <Link
                        href={business.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-sm text-white bg-blue-600 rounded-full px-6 font-medium py-2 hover:bg-blue-700 duration-300 hover:scale-95 flex items-center gap-2 justify-center"
                      >
                        View All Reviews
                        <ExternalLink className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="order-3 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 font-heading">
                    Contact Information
                  </h2>

                  <BusinessContactLinks
                    businessId={business.id}
                    businessName={business.title}
                    phone={business.phone}
                    email={business.email}
                    website={business.website}
                  />

                  <div className="mt-4 md:mt-5">
                    <QuickContactDialog
                      businessId={business.id}
                      businessName={business.title}
                    />
                  </div>
                </div>

                {/* Business Hours */}
                <div className="order-4 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-3">
                  <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-heading">
                      Business Hours
                    </h2>
                    <OpenStatus hours={business.hours} timezone={business.timezone} />
                  </div>
                  {business.hours ? (
                    formatBusinessHours(business.hours)
                  ) : (
                    <p className="text-gray-600">No Business Hours Available</p>
                  )}
                  <div className="text-sm mt-4 text-center text-blue-600 font-medium">
                    {business.opening_hours_confirmation}
                  </div>
                </div>

                {/* Features */}
                {(paymentFeatures.length > 0 ||
                  accessibilityFeatures.length > 0 ||
                  otherFeatures.length > 0) && (
                    <div className="order-7 bg-white rounded-xl shadow-lg p-4 md:p-6 lg:order-4">
                      <div className="space-y-3 md:space-y-4">
                        {paymentFeatures.length > 0 && (
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                              Payment Methods
                            </h3>
                            <div className="flex flex-col gap-2">
                              {paymentFeatures.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 md:gap-3"
                                >
                                  <feature.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-gray-700 capitalize text-sm">
                                    {feature.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {accessibilityFeatures.length > 0 && (
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                              Accessibility
                            </h3>
                            <div className="flex flex-col gap-2">
                              {accessibilityFeatures.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 md:gap-3"
                                >
                                  <feature.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-gray-700 capitalize text-sm">
                                    {feature.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {otherFeatures.length > 0 && (
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                              Other
                            </h3>
                            <div className="flex flex-col gap-2">
                              {otherFeatures.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 md:gap-3"
                                >
                                  <feature.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-gray-700 capitalize text-sm">
                                    {feature.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DirectoryDisclaimer className="mt-8" />
          </div>
        </div>

        <BranchBoundBanner />
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
