const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app sits inside the RRH repo, which has its own package-lock.json.
  // Pin the root here so Next does not trace files from the parent repo.
  outputFileTracingRoot: path.join(__dirname),
  // Shop configs may point image paths at a CDN later; local /public still works.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
