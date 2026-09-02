import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
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
import ClaimListingBanner from "@/components/businesses/ClaimListingBanner";
import ListingFeaturedCta from "@/components/businesses/ListingFeaturedCta";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import ContactInformationSection from "@/components/businesses/ContactInformationSection";
import ServiceCategoriesSection from "@/components/businesses/ServiceCategoriesSection";
import AmenitiesSection from "@/components/businesses/AmenitiesSection";
import AboutSection from "@/components/businesses/AboutSection";
import PhotosSection from "@/components/businesses/PhotosSection";
import OwnerListingViewBar from "@/components/businesses/OwnerListingViewBar";
import { OwnerListingViewProvider } from "@/contexts/OwnerListingViewProvider";
import BusinessHoursSection from "@/components/businesses/BusinessHoursSection";
import ListingBadges from "@/components/businesses/ListingBadges";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import BusinessPageViewTracker from "@/components/businesses/stats/BusinessPageViewTracker";
import NearbyBusinesses from "@/components/businesses/NearbyBusinesses";
import HideWhenListingOwner from "@/components/businesses/HideWhenListingOwner";
import {
  composeDescription,
  composeTitle,
  DEFAULT_OG_IMAGE,
  NOINDEX_ROBOTS,
  INDEX_ROBOTS,
  SITE_URL,
  toTitleCase,
} from "@/lib/seo/metadata";
import { buildBusinessSchema } from "@/lib/seo/structuredData";
import {
  fetchBusinessBySlug,
  fetchBusinessesInCity,
} from "@/lib/api/cachedReads";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import { FEATURED_AFFILIATE_PRODUCT_ALIASES } from "@/lib/affiliateProducts";
import { getBusinessDisplayImage, getBusinessHeroImage } from "@/lib/images";
import { SHORT_CACHE } from "@/lib/cachePolicy";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedQuery,
  getGoogleMapsPlaceUrl,
} from "@/lib/googleMaps";

// Generate metadata for business pages
export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const { data: business, error } = await fetchBusinessBySlug(slug, SHORT_CACHE);

    if (error || !business) {
      return {
        title: "Business Not Found - RadiatorRepairHub",
        description: "The requested business could not be found.",
        robots: NOINDEX_ROBOTS,
      };
    }

    const location = `${business.city.name}, ${business.state.code}`;
    const categoryLabel = toTitleCase(
      business.primary_category?.name || "Radiator Repair"
    );
    const title = composeTitle(
      `${business.title} | ${categoryLabel} in ${location}`,
      { brand: false }
    );
    // meta_description is generated server-side already trimmed to a complete
    // sentence, so prefer it verbatim instead of re-truncating a longer string.
    const description =
      business.meta_description?.trim() ||
      composeDescription(
        `${business.title} is a ${categoryLabel.toLowerCase()} in ${location}.`,
        business.reviews_count > 0 && business.total_score > 0
          ? `Rated ${business.total_score} from ${business.reviews_count.toLocaleString()} reviews.`
          : null,
        business.phone
          ? `Call ${business.phone} or get directions.`
          : "See hours, services, and directions."
      );
    const displayImage = getBusinessDisplayImage(business);

    return {
      title,
      description,
      keywords: business.keywords
        ? `${business.keywords.join(", ")}, radiator repair, ${
            business.title
          }, ${business.city.name}, ${business.state.name}`
        : `${business.title}, radiator repair, ${business.city.name}, ${
            business.state.name
          }, auto repair, cooling system repair, ${
            business.primary_category?.name || "automotive services"
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
        canonical: `${SITE_URL}/business/${slug}`,
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
    const { data: business, error, status } = await fetchBusinessBySlug(
      slug,
      SHORT_CACHE
    );

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

    // Claimed listings keep the page focused on the owner's business; only
    // unclaimed pages surface affiliate products and competing shops.
    const [featuredProducts, nearbyBusinesses] = business.is_claimed
      ? [[], []]
      : await Promise.all([
          fetchActiveAffiliateProductsByAliases(
            FEATURED_AFFILIATE_PRODUCT_ALIASES
          ).then((res) => res.data?.products ?? []),
          fetchBusinessesInCity(business.city?.id, 4, business.id),
        ]);

    const mapsQuery = getGoogleMapsEmbedQuery(business);
    const mapsHref = getGoogleMapsPlaceUrl(business);
    const directionsHref = getGoogleMapsDirectionsUrl(business);

    const structuredData = buildBusinessSchema(business, slug);

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

    const heroImage = getBusinessHeroImage(business);
    if (heroImage?.srcSet) {
      preload(heroImage.src, {
        as: "image",
        imageSrcSet: heroImage.srcSet,
        imageSizes: heroImage.sizes,
        fetchPriority: "high",
      });
    } else if (heroImage?.src) {
      preload(heroImage.src, {
        as: "image",
        fetchPriority: "high",
      });
    }

    const cityHref = `/state/${business.state.code}/city/${business.city.slug}`;
    const stateHref = `/state/${business.state.code}`;
    const categoryHref = business.primary_category
      ? `/category/${business.primary_category.slug}`
      : null;
    return (
      <>
        <script
          key="business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <BusinessPageViewTracker key="business-page-view" businessId={business.id} />

        <OwnerListingViewProvider key="business-owner-view" businessId={business.id}>
        <div className="min-h-screen bg-background pb-24 md:pb-32">
          <BusinessHeroBanner
            heroImage={heroImage}
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
                <OpenStatus
                  hours={business.hours}
                  timezone={business.timezone}
                />
                <ListingBadges business={business} size="md" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-5">
                <BusinessHeroActions
                  businessId={business.id}
                  businessName={business.title}
                  phone={business.phone}
                  email={business.email}
                  emailStatus={business.email_status}
                  isClaimed={Boolean(business.is_claimed)}
                  mapsHref={directionsHref}
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
            isClaimed={Boolean(business.is_claimed)}
            mapsHref={directionsHref}
            placement="sticky"
          />

          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-8 lg:px-8">
            <ListingFeaturedCta
              businessId={business.id}
              businessSlug={business.slug}
              businessName={business.title}
            />
            <OwnerListingViewBar />
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
              <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-8">
                <ClaimListingBanner
                  placement="desktop"
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  email={business.email}
                  emailStatus={business.email_status}
                  isClaimed={Boolean(business.is_claimed)}
                  hasDuplicateEmail={Boolean(business.has_duplicate_email)}
                />
                <AboutSection
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  description={business.description || ""}
                />

                <PhotosSection
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  images={business.images || []}
                  primaryImageId={business.primary_image_id}
                  imageUrl={business.image_url}
                  hideDefaultImage={Boolean(business.hide_default_image)}
                  cdnStored={Boolean(business.cdn_stored)}
                />

                <ServiceCategoriesSection
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  primaryCategory={business.primary_category}
                  secondaryCategories={business.secondary_categories || []}
                />

                <div className="order-5 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-3">
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
                        Radiator Repair in {business.city.name}
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
                            <a
                              href={mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 font-medium text-interactive hover:text-primary"
                            >
                              <MapPin className="h-5 w-5" />
                              View {business.address || business.title} on
                              Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {mapsHref ? (
                      <div className="pt-2">
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open in Google Maps
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="contents lg:flex lg:flex-col lg:gap-6">
                <div className="order-1 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-1">
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
                            className={`h-6 w-6 ${
                              i < Math.floor(business.total_score)
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
                      isFeatured={Boolean(business.is_featured)}
                      hasDuplicateEmail={Boolean(business.has_duplicate_email)}
                      lastEditedAt={business.last_edited_at}
                    />
                  </div>
                </div>

                <ContactInformationSection
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  phone={business.phone}
                  email={business.email}
                  website={business.website}
                  emailStatus={business.email_status}
                  isClaimed={Boolean(business.is_claimed)}
                />

                <BusinessHoursSection
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  hours={business.hours || []}
                  timezone={business.timezone}
                />

                <ClaimListingBanner
                  placement="mobile"
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
                  email={business.email}
                  emailStatus={business.email_status}
                  isClaimed={Boolean(business.is_claimed)}
                  hasDuplicateEmail={Boolean(business.has_duplicate_email)}
                />

                <AmenitiesSection
                  businessId={business.id}
                  businessSlug={business.slug}
                  businessName={business.title}
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
                    <MapPinned
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
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
                    <MapPin
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
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
                      <Tags
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
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
                    href="/search"
                    className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-interactive"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                      <Search
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
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

            {!business.is_claimed ? (
              <HideWhenListingOwner>
                <NearbyBusinesses
                  businesses={nearbyBusinesses}
                  cityName={business.city.name}
                  cityHref={cityHref}
                />
                {featuredProducts.length > 0 ? (
                  <AffiliateProductsSection
                    products={featuredProducts}
                    title="Recommended Amazon Tools & Supplies"
                    description={`Optional DIY supplies recommended by RadiatorRepairHub. These products are not sold, endorsed, or affiliated with ${business?.title ?? "this business"}.`}
                    descriptionVariant="notice"
                    disclosure="Product links are RadiatorRepairHub Amazon Associate recommendations. As an Amazon Associate, RadiatorRepairHub earns from qualifying purchases. This shop is not responsible for these products or purchases."
                    variant="related"
                    layout="carousel"
                  />
                ) : null}
              </HideWhenListingOwner>
            ) : null}

            <DirectoryDisclaimer className="mt-10" />
          </div>
        </div>
        </OwnerListingViewProvider>
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
