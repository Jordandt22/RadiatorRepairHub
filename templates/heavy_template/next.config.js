const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app sits inside the RRH repo, which has its own package-lock.json.
  // Pin the root here so Next does not trace files from the parent repo.
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
