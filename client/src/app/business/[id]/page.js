import React from "react";

// Components
import NotFoundDisplay from "@/components/pages/not-found/NotFoundDisplay";

async function Page({ params }) {
  const { id } = await params;
  const res = await fetch(`${process.env.API_URI}/businesses/${id}`);
  const data = await res.json();

  if (!data.data) {
    return (
      <NotFoundDisplay
        link={{ path: "/search", text: "Go back to the Search Page" }}
        message="The business you are looking for does not exist."
      />
    );
  }
  4;

  const business = data.data;
  return <div>{business.title}</div>;
}

export default Page;
