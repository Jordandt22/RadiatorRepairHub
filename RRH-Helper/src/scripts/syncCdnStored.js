/**
 * Deprecated: CDN sync from local Cloudinary photo manifests is obsolete.
 * CDN uploads now go through the admin upload-photos job → Cloudflare Images.
 */
console.error(
  [
    "syncCdnStored.js is deprecated.",
    "CDN flags are set by the admin Upload Photos job (Cloudflare Images).",
  ].join(" ")
);
process.exit(1);
