import { NextResponse } from "next/server";

export async function GET() {
  const robotsTxt = `# Robots.txt for RadiatorRepairHub
# Allow all search engines to crawl public content

User-agent: *
Allow: /

# Disallow sensitive or private areas
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Allow important pages for crawling
Allow: /search
Allow: /categories
Allow: /category/
Allow: /states
Allow: /state/
Allow: /business/
Allow: /featured
Allow: /faq
Allow: /about
Allow: /contact
Allow: /get-listed

# Sitemap location
Sitemap: https://radiatorrepairhub.com/sitemap.xml

# Specific instructions for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Block AI training crawlers (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400", // Cache for 24 hours
    },
  });
}
