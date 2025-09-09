import Image from "next/image";

export default function Home() {
  // Placeholder data for featured listings
  const featuredListings = [
    {
      id: 1,
      title: "AutoCool Radiator Services",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 127,
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      postalCode: "90210",
    },
    {
      id: 2,
      title: "Premier Radiator Repair",
      image: "/api/placeholder/300/200",
      rating: 4.6,
      reviews: 89,
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
    },
    {
      id: 3,
      title: "CoolTech Auto Solutions",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 156,
      city: "Chicago",
      state: "IL",
      country: "USA",
      postalCode: "60601",
    },
    {
      id: 4,
      title: "Radiator Masters",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 98,
      city: "Houston",
      state: "TX",
      country: "USA",
      postalCode: "77001",
    },
    {
      id: 5,
      title: "CoolFlow Automotive",
      image: "/api/placeholder/300/200",
      rating: 4.5,
      reviews: 73,
      city: "Phoenix",
      state: "AZ",
      country: "USA",
      postalCode: "85001",
    },
    {
      id: 6,
      title: "Elite Radiator Works",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 112,
      city: "Philadelphia",
      state: "PA",
      country: "USA",
      postalCode: "19101",
    },
    {
      id: 7,
      title: "ProCool Radiator Services",
      image: "/api/placeholder/300/200",
      rating: 4.6,
      reviews: 84,
      city: "San Antonio",
      state: "TX",
      country: "USA",
      postalCode: "78201",
    },
    {
      id: 8,
      title: "CoolMax Auto Repair",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 143,
      city: "San Diego",
      state: "CA",
      country: "USA",
      postalCode: "92101",
    },
    {
      id: 9,
      title: "Radiator Express",
      image: "/api/placeholder/300/200",
      rating: 4.4,
      reviews: 67,
      city: "Dallas",
      state: "TX",
      country: "USA",
      postalCode: "75201",
    },
    {
      id: 10,
      title: "CoolTech Pro Services",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 95,
      city: "San Jose",
      state: "CA",
      country: "USA",
      postalCode: "95101",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">
                RadiatorRepairHub
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Browse by City
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Services
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden py-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating radiator/car elements */}
          <div className="absolute top-20 left-10 w-16 h-16 opacity-20 animate-pulse">
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300">
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                rx="5"
                fill="currentColor"
              />
              <rect
                x="30"
                y="40"
                width="40"
                height="20"
                rx="2"
                fill="currentColor"
              />
              <circle cx="25" cy="50" r="3" fill="currentColor" />
              <circle cx="75" cy="50" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-40 right-20 w-12 h-12 opacity-15 animate-bounce">
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400">
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                rx="5"
                fill="currentColor"
              />
              <rect
                x="30"
                y="40"
                width="40"
                height="20"
                rx="2"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 opacity-10 animate-pulse">
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-200">
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                rx="5"
                fill="currentColor"
              />
              <rect
                x="30"
                y="40"
                width="40"
                height="20"
                rx="2"
                fill="currentColor"
              />
              <circle cx="25" cy="50" r="3" fill="currentColor" />
              <circle cx="75" cy="50" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-60 right-1/3 w-14 h-14 opacity-20 animate-bounce">
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300">
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                rx="5"
                fill="currentColor"
              />
              <rect
                x="30"
                y="40"
                width="40"
                height="20"
                rx="2"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-10 font-heading">
              Find Trusted Radiator Repair
              <span className="block text-blue-300 mt-4">
                Services Near You
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto font-body">
              Connect with certified radiator repair specialists in your area.
              Compare services, read reviews, and keep your vehicle running
              cool.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your city or ZIP code..."
                  className="w-full px-6 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900"
                />
                <button className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="pt-24 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Featured Radiator Repair Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
              Discover top-rated radiator repair shops in your area with
              verified reviews and ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 font-heading">
                    {listing.title}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(listing.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {listing.rating}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({listing.reviews.toLocaleString()})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {listing.city}, {listing.state} {listing.postalCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 font-heading">
                RadiatorRepairHub
              </h3>
              <p className="text-gray-400 mb-4 max-w-md font-body">
                Your trusted directory for finding reliable radiator repair
                services across the United States. Connect with certified
                professionals and keep your vehicle running smoothly.
              </p>
            </div>

            {/* Cities/Regions */}
            <div>
              <h4 className="text-lg font-semibold mb-4 font-heading">
                Popular Cities
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Los Angeles, CA
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    New York, NY
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Chicago, IL
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Houston, TX
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Phoenix, AZ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Philadelphia, PA
                  </a>
                </li>
              </ul>
            </div>

            {/* Service Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4 font-heading">
                Services
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Radiator Repair
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Radiator Replacement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cooling System Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Thermostat Replacement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Water Pump Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Emergency Repair
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} RadiatorRepairHub. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
