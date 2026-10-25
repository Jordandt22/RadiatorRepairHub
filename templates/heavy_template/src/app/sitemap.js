import { siteOrigin } from "@/lib/seo";

const routes = ["/", "/services", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap() {
  const origin = siteOrigin();
  return routes.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/privacy" || path === "/terms" ? 0.3 : 0.7,
  }));
}
