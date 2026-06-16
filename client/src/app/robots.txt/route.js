import { NextResponse } from "next/server";

export async function GET() {
  const robotsTxt = `# Robots.txt for RadiatorRepairHub

User-agent: *
Allow: /

# Disallow internal / non-public paths
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Sitemap location
Sitemap: https://radiatorrepairhub.com/sitemap.xml

# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: FacebookBot
Disallow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400", // Cache for 24 hours
    },
  });
}
