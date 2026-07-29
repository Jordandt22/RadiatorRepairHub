import { fetchApi } from "./fetchApi";
import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function loginOwner({ email, password }) {
  return fetchApi("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
}

export async function updateOwnerEmail({ email }) {
  return fetchAuthenticatedApi("/auth/email", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
