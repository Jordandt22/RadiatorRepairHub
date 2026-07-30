import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function updateBusinessContact({
  businessId,
  phone,
  email,
  website,
}) {
  return fetchAuthenticatedApi("/businesses/contact", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessId,
      phone,
      email: email || "",
      website: website || "",
    }),
  });
}
