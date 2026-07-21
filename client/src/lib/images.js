// Google-hosted business photos 502 via /_next/image on Vercel in production.
// The dev optimizer works; load directly only in production builds.
export const bypassImageOptimizer = process.env.NODE_ENV === "production";
