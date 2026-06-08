export const SITE_URL = "https://radiatorrepairhub.com";

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/assets/logos/logo.png`,
  width: 1200,
  height: 630,
  alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
};

export const DEFAULT_TWITTER = {
  card: "summary_large_image",
  title: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
  description:
    "Find radiator repair near me, auto repair shops, and radiator services in your area.",
  images: [DEFAULT_OG_IMAGE.url],
};

export const INDEX_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const NOINDEX_ROBOTS = {
  index: false,
  follow: true,
};

export const NOINDEX_NOFOLLOW_ROBOTS = {
  index: false,
  follow: false,
};

export function buildOpenGraph({ title, description, url, images }) {
  return {
    title,
    description,
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    ...(url && { url: `${SITE_URL}${url}` }),
    images: images ?? [DEFAULT_OG_IMAGE],
  };
}

export function buildTwitter({ title, description, images }) {
  return {
    card: "summary_large_image",
    title,
    description,
    images: images ?? [DEFAULT_OG_IMAGE.url],
  };
}

export function buildPageMetadata({
  title,
  description,
  keywords,
  path,
  openGraph,
  twitter,
  robots = INDEX_ROBOTS,
}) {
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical: path ? `${SITE_URL}${path}` : SITE_URL,
    },
    openGraph: openGraph ?? buildOpenGraph({ title, description, url: path }),
    twitter: twitter ?? buildTwitter({ title, description }),
    robots,
  };
}

export const NOT_FOUND_METADATA = buildPageMetadata({
  title: "Page Not Found - RadiatorRepairHub",
  description: "The page you are looking for could not be found.",
  robots: NOINDEX_ROBOTS,
});

export const MAINTENANCE_METADATA = buildPageMetadata({
  title: "Maintenance - RadiatorRepairHub",
  description: "RadiatorRepairHub is temporarily undergoing scheduled maintenance.",
  robots: NOINDEX_NOFOLLOW_ROBOTS,
});
