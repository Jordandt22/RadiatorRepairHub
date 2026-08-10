import { fetchApi } from "@/lib/api/fetchApi";

export async function submitFeedbackSurvey(payload) {
  return fetchApi("/feedback-surveys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
