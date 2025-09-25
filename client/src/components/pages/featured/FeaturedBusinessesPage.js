import React from "react";
import Header from "./Header";
import FeaturedGrid from "./FeaturedGrid";

async function FeaturedBusinessesPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/featured`
  );
  const data = await res.json();
  const businesses = data.data;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header />
      <FeaturedGrid businesses={businesses} />
    </div>
  );
}

export default FeaturedBusinessesPage;
