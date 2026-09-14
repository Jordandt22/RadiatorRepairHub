function getMapsSearchText(business) {
  if (business?.address) return business.address;
  if (business?.latitude != null && business?.longitude != null) {
    return `${business.latitude},${business.longitude}`;
  }
  return business?.title || "";
}

export function getGoogleMapsPlaceUrl(business) {
  const query = getMapsSearchText(business);
  if (!query && !business?.place_id) return null;

  const params = new URLSearchParams({ api: "1" });
  if (query) params.set("query", query);
  if (business?.place_id) params.set("query_place_id", business.place_id);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
