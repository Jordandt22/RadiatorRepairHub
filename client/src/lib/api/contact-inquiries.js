import { fetchApi } from "@/lib/api/fetchApi";

export async function submitContactInquiry(payload) {
  return fetchApi("/contact-inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
