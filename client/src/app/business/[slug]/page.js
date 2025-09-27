import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  Phone,
  Globe,
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
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";

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
  const res = await fetch(`${process.env.API_URI}/businesses/${slug}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    return (
      <ErrorDisplay
        status={res.status}
        code={data?.error?.code}
        message={data?.error?.message}
      />
    );
  }

  if (!data?.data) {
    return notFound();
  }

  const business = data.data;

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
  const formatBusinessHours = (openingHours) => {
    if (!openingHours || !Array.isArray(openingHours)) {
      return <p className="text-sm text-gray-500">Hours not available</p>;
    }

    return (
      <div className="space-y-2">
        {openingHours.map((day, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{day.day}</span>
            <div className="text-gray-600 text-right">
              {day.is_closed ? (
                <span>Closed</span>
              ) : (
                <div className="space-y-1">
                  {day.hours.split(",").map((timePeriod, timeIndex) => (
                    <div key={timeIndex} className="text-sm">
                      {timePeriod.trim()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero Section with Business Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-200">
        {business.image_url ? (
          <Image
            src={business.image_url}
            alt={business.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-500 text-lg">No image available</p>
            </div>
          </div>
        )}

        {/* Overlay with business title */}
        <div className="absolute inset-0 bg-black/75 flex items-end">
          <div className="w-full p-6 text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">
              {business.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-semibold text-lg">
                  {business.total_score}
                </span>
              </div>
              <span className="text-lg mr-2">
                ({business.reviews_count.toLocaleString()} reviews)
              </span>
              <OpenStatus hours={business.hours} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                About
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-gray-600 leading-relaxed">
                    {business.description}
                  </p>
                </div>
                <div className="relative w-full h-48 md:h-64 bg-gray-200 rounded-lg overflow-hidden">
                  {business.image_url ? (
                    <Image
                      src={business.image_url}
                      alt={business.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center"
                      priority={false}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Star className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          No image available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                Categories
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Primary Category
                  </h3>
                  {business.primary_category ? (
                    <Link
                      href={`/category/${business.primary_category.slug}`}
                      className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-500 hover:text-white duration-300 font-medium transition-colors capitalize"
                    >
                      {business.primary_category.name}
                    </Link>
                  ) : (
                    <p className="text-gray-600">None</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                Location
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <p className="text-gray-700">{business.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/state/${business.state.code}/city/${business.city.slug}`}
                    className="text-white bg-blue-600 rounded-full px-6 font-medium py-1 hover:bg-blue-700 duration-300 hover:scale-95"
                  >
                    {business.city.name}
                  </Link>
                  <Link
                    href={`/state/${business.state.code}`}
                    className="text-white bg-blue-600 rounded-full px-6 font-medium py-1 hover:bg-blue-700 duration-300 hover:scale-95"
                  >
                    {business.state.name}
                  </Link>
                </div>

                {/* Google Maps Embed */}
                <div className="w-full h-90 md:h-120 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${
                      process.env.GOOGLE_MAPS_API_KEY
                    }&q=${encodeURIComponent(business.address)}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map showing location of ${business.title}`}
                  />
                </div>

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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                Rating
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
                        className={`w-6 h-6 ${
                          i < Math.floor(business.total_score)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">
                  Based on {business.reviews_count.toLocaleString()} reviews
                </p>

                {business.url && (
                  <Link
                    href={business.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 text-white bg-blue-600 rounded-full px-6 font-medium py-1 hover:bg-blue-700 duration-300 hover:scale-95 flex items-center gap-1 justify-center"
                  >
                    View All Reviews
                  </Link>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                Contact
              </h2>
              <div className="space-y-4">
                {business.phone ? (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <a
                      href={`tel:${business.phone}`}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      {business.phone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">
                      No Phone Number Available
                    </span>
                  </div>
                )}

                {business.website ? (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <Link
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">No Website Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 font-heading">
                  Business Hours
                </h2>
                <OpenStatus hours={business.hours} />
              </div>
              {business.opening_hours ? (
                formatBusinessHours(business.opening_hours)
              ) : (
                <p className="text-gray-600">No Business Hours Available</p>
              )}
            </div>

            {/* Features */}
            {(paymentFeatures.length > 0 ||
              accessibilityFeatures.length > 0 ||
              otherFeatures.length > 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                  Features
                </h2>
                <div className="space-y-4">
                  {paymentFeatures.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Payment Methods
                      </h3>
                      <div className="flex flex-col gap-2">
                        {paymentFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <feature.icon className="w-4 h-4 text-blue-600" />
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Accessibility
                      </h3>
                      <div className="flex flex-col gap-2">
                        {accessibilityFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <feature.icon className="w-4 h-4 text-blue-600" />
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Other
                      </h3>
                      <div className="flex flex-col gap-2">
                        {otherFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <feature.icon className="w-4 h-4 text-blue-600" />
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
    </div>
  );
}

export default Page;
