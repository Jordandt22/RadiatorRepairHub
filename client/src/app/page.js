// Components
import HeroContext from "./HeroContext";
import FeaturedListings from "./FeaturedListings";

export default async function Home() {
  const res = await fetch(process.env.API_URI + "/businesses/featured");
  const JSONData = await res.json();
  const featuredListings = JSONData.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroContext />

      {/* Featured Listings Section */}
      <FeaturedListings featuredListings={featuredListings} />
    </div>
  );
}
