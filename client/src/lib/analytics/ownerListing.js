export function captureOwnerListingUpdate(
  posthog,
  {
    businessId,
    businessSlug,
    businessName,
    section,
    imageAction,
  } = {}
) {
  if (!posthog || !section) return;

  posthog.capture("owner_listing_updated", {
    business_id: businessId || undefined,
    business_slug: businessSlug || undefined,
    business_name: businessName || undefined,
    section,
    source: "business_page",
    image_action: imageAction || undefined,
  });
}
