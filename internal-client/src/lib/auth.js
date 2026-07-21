export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;

    const payload = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
