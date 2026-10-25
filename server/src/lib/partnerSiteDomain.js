/**
 * Bare host for a partner site, such as ironbayradiator.com.
 * Strips a scheme, path, port, and a leading www.
 */
export function normalizePartnerDomain(value) {
  if (typeof value !== "string") return null;
  let raw = value.trim().toLowerCase();
  if (!raw) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;

  let host;
  try {
    const url = new URL(raw);
    if (url.username || url.password) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    host = url.hostname.replace(/\.$/, "");
  } catch {
    return null;
  }

  if (host.startsWith("www.")) host = host.slice(4);
  if (!host || host.includes("..")) return null;
  if (
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      host
    )
  ) {
    return null;
  }
  if (host.length > 253) return null;
  return host;
}

/** https origins a browser may use for this stored host. */
export function allowedOriginsForDomain(domain) {
  const host = normalizePartnerDomain(domain);
  if (!host) return [];
  const origins = [`https://${host}`];
  if (host.split(".").length === 2) origins.push(`https://www.${host}`);
  return origins;
}
