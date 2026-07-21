// Production: skip /_next/image (502 on Vercel) and load Google URLs in the browser
// with no referrer — Google returns 403 when radiatorrepairhub.com is sent as Referer.
// Dev: keep the Next.js optimizer, which works locally.
export const bypassImageOptimizer = process.env.NODE_ENV === "production";
