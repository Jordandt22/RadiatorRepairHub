/** Allow only same-origin relative paths (blocks //evil.com open redirects). */
export function safeRedirectPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}
