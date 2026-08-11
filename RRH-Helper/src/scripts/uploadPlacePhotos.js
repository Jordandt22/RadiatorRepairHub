/**
 * Deprecated: Place photo CDN uploads moved to the admin upload-photos job
 * (server BullMQ worker → Cloudflare Images).
 *
 * Use the internal-client Upload Photos UI instead of this script.
 */
console.error(
  [
    "uploadPlacePhotos.js is deprecated.",
    "Use the admin Upload Photos job (Cloudflare Images) instead of RRH-Helper.",
  ].join(" ")
);
process.exit(1);
