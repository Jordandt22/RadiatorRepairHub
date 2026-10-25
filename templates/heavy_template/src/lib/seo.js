import { callLabel, e164, phoneDisplay } from "./phone";

export function siteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3002";
}

export function napText(config) {
  const { shop } = config;
  return [
    shop.name,
    shop.address,
    `${shop.city}, ${shop.state} ${shop.zip}`,
    phoneDisplay(shop),
  ].join("\n");
}

export function streetLine(config) {
  const { shop } = config;
  return `${shop.address}, ${shop.city}, ${shop.state} ${shop.zip}`;
}

/** Meta keywords from config, or derived from city + services (Google ignores these for ranking). */
export function seoKeywords(config) {
  if (config.seo.keywords?.length) return config.seo.keywords;
  const { shop, services } = config;
  const derived = [
    shop.city && shop.state ? `${shop.city} ${shop.state}` : null,
    ...(services ?? []).slice(0, 4).map((s) =>
      shop.city ? `${s.title} ${shop.city}` : s.title,
    ),
  ].filter(Boolean);
  return derived.length ? derived : undefined;
}

export function serviceList(config) {
  const titles = (config.services ?? []).map((s) => s.title).filter(Boolean);
  if (!titles.length) return config.shop.tagline;
  if (titles.length === 1) return titles[0];
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
  return `${titles.slice(0, -1).join(", ")}, and ${titles[titles.length - 1]}`;
}

function fallback(config, page) {
  const { shop, seo, about } = config;
  const display = phoneDisplay(shop);
  const place = `${shop.city}, ${shop.state}`;
  switch (page) {
    case "home":
      return { title: seo.title, description: seo.description };
    case "services":
      return {
        title: `Services | ${shop.name} | ${place}`,
        description: `${serviceList(config)} in ${place}. Call ${display}.`,
      };
    case "about": {
      const years = about?.yearsInBusiness;
      return {
        title: `About | ${shop.name} | ${place}`,
        description: years
          ? `${shop.name} in ${place} for ${years} years. ${shop.tagline}`
          : `${shop.name} in ${place}. ${shop.tagline}`,
      };
    }
    case "contact":
      return {
        title: `Contact | ${shop.name} | ${place}`,
        description: `Call ${display} or send a quote. ${shop.address}, ${place} ${shop.zip}.`,
      };
    case "privacy":
      return {
        title: `Privacy | ${shop.name}`,
        description: `How ${shop.name} uses information you send through this site.`,
      };
    case "terms":
      return {
        title: `Terms | ${shop.name}`,
        description: `Terms of use for the ${shop.name} website.`,
      };
  }
}

export function pageMeta(config, page) {
  return config.seo.pages?.[page] ?? fallback(config, page);
}

export function routeMetadata(config, page, path) {
  const { title, description } = pageMeta(config, page);
  const og = config.seo.ogImage;
  return {
    title,
    description,
    keywords: seoKeywords(config),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: config.shop.name,
      locale: "en_US",
      type: "website",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: og
      ? { card: "summary_large_image", title, description, images: [og] }
      : { title, description },
    icons: config.seo.favicon ? { icon: config.seo.favicon } : undefined,
  };
}

function openingHoursSpec(config) {
  const dayMap = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  const specs = [];
  for (const [key, day] of Object.entries(dayMap)) {
    const value = config.hours[key];
    if (value === "Closed") continue;
    const [opens, closes] = value.split("-").map((s) => s.trim());
    const to24 = (t) => {
      const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!m) return undefined;
      let h = Number(m[1]);
      const min = m[2];
      const ap = m[3].toUpperCase();
      if (ap === "PM" && h !== 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${min}`;
    };
    const o = to24(opens);
    const c = to24(closes);
    if (!o || !c) continue;
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day,
      opens: o,
      closes: c,
    });
  }
  return specs;
}

export function sameAs(config) {
  const urls = [];
  const add = (url) => {
    const value = typeof url === "string" ? url.trim() : "";
    if (value && !urls.includes(value)) urls.push(value);
  };
  add(config.seo.rrhListingUrl);
  add(config.reviews?.googleUrl);
  const s = config.contact?.socials ?? {};
  for (const v of [s.facebook, s.instagram, s.youtube, s.tiktok]) add(v);
  return urls;
}

export function jsonLdGraph(config, origin, breadcrumbs) {
  const { shop, location, reviews, services, brand, seo } = config;
  const imagePath = seo.ogImage || config.hero.imagePath;
  const autoRepair = {
    "@type": "AutoRepair",
    "@id": `${origin}/#business`,
    name: shop.name,
    description: seo.description,
    image: `${origin}${imagePath}`,
    url: origin,
    telephone: e164(shop),
    email: shop.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address,
      addressLocality: shop.city,
      addressRegion: shop.state,
      postalCode: shop.zip,
      addressCountry: "US",
    },
    openingHoursSpecification: openingHoursSpec(config),
  };
  if (brand?.logoPath) {
    autoRepair.logo = `${origin}${brand.logoPath}`;
  }
  if (location.googleMapsUrl) {
    autoRepair.hasMap = location.googleMapsUrl;
  }
  if (location.lat != null && location.lng != null) {
    autoRepair.geo = {
      "@type": "GeoCoordinates",
      latitude: location.lat,
      longitude: location.lng,
    };
  }
  const same = sameAs(config);
  if (same.length) autoRepair.sameAs = same;
  const areas = (location.serviceAreas ?? [])
    .map((area) => (typeof area === "string" ? area.trim() : ""))
    .filter(Boolean)
    .map((name) => {
      const city = { "@type": "City", name, addressCountry: "US" };
      if (shop.state) city.addressRegion = shop.state;
      return city;
    });
  if (areas.length) autoRepair.areaServed = areas;
  if (reviews?.rating != null && reviews?.count != null && reviews.count > 0) {
    autoRepair.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.rating,
      reviewCount: reviews.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (services?.length) {
    autoRepair.makesOffer = services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.description,
        url: `${origin}/services#${s.slug}`,
      },
    }));
  }
  const graph = [
    autoRepair,
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: shop.name,
      url: origin,
      description: seo.description,
      publisher: { "@id": `${origin}/#business` },
    },
  ];
  if (breadcrumbs && breadcrumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: `${origin}${b.path}`,
      })),
    });
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export { callLabel };
