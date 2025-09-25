import React from "react";

function Header() {
  return (
    <div className="bg-slate-900 border-b border-gray-200 pt-6 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
          Featured Businesses
        </h1>
        <p className="text-lg text-gray-300 font-body">
          Discover our top-rated radiator repair specialists. These featured
          businesses have earned exceptional reviews and provide outstanding
          service to their communities.
        </p>
      </div>
    </div>
  );
}

export default Header;
