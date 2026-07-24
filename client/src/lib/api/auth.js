import { fetchApi } from "./fetchApi";

export async function loginOwner({ email, password }) {
  return fetchApi("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
}
