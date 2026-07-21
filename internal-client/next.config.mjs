import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Turbopack rooted on `internal-client/` — the repo also has a root
  // package-lock.json, which otherwise makes Next resolve deps from the wrong place.
  turbopack: {
    root: __dirname,
  },
  reactCompiler: true,
};

export default nextConfig;
