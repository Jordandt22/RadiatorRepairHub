import { Suspense } from "react";
import LocationBusinessesPageContent from "@/components/pages/locations/LocationBusinessesPageContent";
import BusinessesTableSkeleton from "@/components/pages/businesses/BusinessesTableSkeleton";

function Fallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <BusinessesTableSkeleton />
    </div>
  );
}

export default async function CityBusinessesPage({ params }) {
  const { "city-slug": citySlug } = await params;
  return (
    <Suspense fallback={<Fallback />}>
      <LocationBusinessesPageContent kind="city" param={citySlug} />
    </Suspense>
  );
}
