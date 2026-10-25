# Shared shop config and UI contracts

Source of truth for **both** templates. Do not fork this schema in a template `DESIGN.md`.

- [`../minimal_template/DESIGN.md`](../minimal_template/DESIGN.md) — visual skin + display rules
- [`../heavy_template/DESIGN.md`](../heavy_template/DESIGN.md) — visual skin + display rules
- Demo data: [`../minimal_template/content/demo.json`](../minimal_template/content/demo.json), [`../heavy_template/content/demo.json`](../heavy_template/content/demo.json)

Templates share JSON shape, routes, section IDs, chrome copy, form fields, phone/hours formatting, metadata keys, folder map, and icon set. They differ only in **tokens, density, and which fields they render by default**.

---

## 1. ShopConfig

File: `content/{client}.json`. Demo: `content/demo.json`.

```typescript
interface ShopConfig {
  shop: {
    name: string;
    tagline: string;
    /** Digits for tel: — US: 10 digits, or E.164 without spaces (e.g. 12535550142). */
    phone: string;
    /** Human number, e.g. "(253) 555-0142". If omitted, format from `phone`. */
    phoneDisplay?: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: {
    /** "8:00 AM - 5:30 PM" or "Closed". Hyphen, 12-hour, spaces around the dash. */
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
    notes?: string;
    /** IANA tz for open/closed badge, e.g. "America/Los_Angeles". */
    timezone?: string;
  };
  brand: {
    accentColor: string;
    logoPath: string;
    theme?: "light" | "dark";
  };
  features?: {
    showEmailInHeader?: boolean;
    showHoursInHeader?: boolean;
    showBackToTop?: boolean;
    embedMap?: boolean;
    showServiceAreas?: boolean;
  };
  hero: {
    headline: string;
    subheadline: string;
    imagePath: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  services: Array<{
    title: string;
    description: string;
    /** Lucide icon name from the allowed set, or omit. */
    icon?: string;
    slug?: string;
  }>;
  /**
   * Optional. Shown on `/services` under the service list.
   * Empty / omitted → hide the FAQ section and FAQPage JSON-LD.
   * Prefer 4–6 shop-specific Q&As (process, timing, walk-ins, warranty).
   */
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  about: {
    mission: string;
    bullets: string[];
    yearsInBusiness?: number;
    warranty?: string;
  };
  trust: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
  reviews: {
    googleUrl: string;
    rating?: number;
    count?: number;
    items: Array<{
      author: string;
      quote: string;
      rating?: number;
    }>;
  };
  gallery: {
    enabled: boolean;
    images: Array<{ src: string; alt: string }>;
  };
  location: {
    /**
     * Google Place ID (ChIJ…). When set, address / directions / Google review
     * links use Maps URLs with `query_place_id` / `placeid`. Get it from
     * https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
     * Must be THIS shop’s listing — not another business.
     */
    placeId?: string;
    googleMapsUrl: string;
    embedUrl?: string;
    serviceAreas?: string[];
    /** WGS84. Used in JSON-LD GeoCoordinates. Approximate is fine for demo. */
    lat?: number;
    lng?: number;
  };
  contact: {
    formAction?: string;
    socials: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      tiktok?: string;
    };
  };
  seo: {
    /** Home fallback title if `pages.home` is omitted. */
    title: string;
    description: string;
    /**
     * Client's listing on radiatorrepairhub.com.
     * Shape: https://radiatorrepairhub.com/business/{slug}-{uuid}
     * Example (URL shape only): https://radiatorrepairhub.com/business/s-and-w-radiator-shop-and-services-2ba398f6-f9e9-40e5-9337-876b54f6fbf4
     * Must be THIS shop's listing. Empty → hide the RRH button.
     */
    rrhListingUrl?: string;
    ogImage?: string;
    favicon?: string;
    /** Optional. Google ignores meta keywords; use for completeness only. */
    keywords?: string[];
    pages?: {
      home?: { title: string; description: string };
      services?: { title: string; description: string };
      about?: { title: string; description: string };
      contact?: { title: string; description: string };
      privacy?: { title: string; description: string };
      terms?: { title: string; description: string };
    };
  };
}
```

`seo.ogImage` and `seo.favicon` are optional paths under `public/`. If omitted, use `/images/demo/og.jpg` and `/favicon.ico` when those files exist; otherwise skip OG image / use a text-only title.

If `seo.pages.{route}` is omitted, generate:

| Route       | Title                                   | Description                                                              |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `/`         | `seo.title`                             | `seo.description`                                                        |
| `/services` | `Services \| {name} \| {city}, {state}` | `{tagline}. Call {phoneDisplay}.`                                        |
| `/about`    | `About \| {name} \| {city}, {state}`    | `{name} in {city}, {state}. {tagline}`                                   |
| `/contact`  | `Contact \| {name} \| {city}, {state}`  | `Call {phoneDisplay} or send a quote. {address}, {city}, {state} {zip}.` |
| `/privacy`  | `Privacy \| {name}`                     | `How {name} uses information you send through this site.`                |
| `/terms`    | `Terms \| {name}`                       | `Terms of use for the {name} website.`                                   |

---

## 2. Feature defaults

| Flag                | minimal_template          | heavy_template                   |
| ------------------- | ------------------------- | -------------------------------- |
| `showEmailInHeader` | false                     | true                             |
| `showHoursInHeader` | false                     | true                             |
| `showBackToTop`     | false                     | true                             |
| `embedMap`          | false (ignore `embedUrl`) | true if `embedUrl` non-empty     |
| `showServiceAreas`  | false (ignore array)      | true if `serviceAreas` non-empty |

Home caps: minimal trust **3**, services **4**, reviews **2–3**, gallery **4** if enabled. Heavy trust **4**, services **6–8**, reviews **3+**, gallery **6** visible.

Explicit `features.*` in JSON **overrides** the template default.

---

## 3. Phone and hours

### Phone

- Store `shop.phone` as digits only (no spaces, dashes, or parentheses). US: 10 digits. `tel:` href is `tel:+1` + those 10 digits when length is 10; if the string already starts with `1` and is 11 digits, `tel:+` + digits.
- Display `shop.phoneDisplay` if set. Else format 10-digit US as `(XXX) XXX-XXXX`.
- Every call button label: **`Call {phoneDisplay}`** (same string in header, hero, sticky bar, footer).

### Hours

- Each day is either `Closed` (exact, capital C) or `h:mm AM/PM - h:mm AM/PM` with a regular hyphen (`-`), spaces on both sides, no leading zeros on hour (`8:00 AM` not `08:00 AM`).
- Compact header summary (heavy): `Mon-Fri {start}-{end}` plus Sat if not Closed, e.g. `Mon-Fri 8:00 AM - 5:30 PM · Sat 8:00 AM - 1:00 PM`.
- “Open today until {end}” / “Closed now” only when `hours.timezone` is set. Compare local time in that zone to today’s window. If today is `Closed`, show `Closed today`.
- Footer and Hours section: list all seven days, `Mon` … `Sun` labels, tabular numbers.

---

## 4. Routes, nav, and home section IDs

### Routes (required)

| Route          | Nav         | Purpose                                                                                                |
| -------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `/`            | Home        | Landing: hero, trust, services preview, about teaser, reviews, hours teaser, contact teaser, final CTA |
| `/services`    | Services    | Full `services[]` list (no home cap). Optional `faq[]` section + FAQPage JSON-LD                       |
| `/about`       | About       | Mission, why us, years, warranty, **View on RadiatorRepairHub**                                        |
| `/contact`     | Contact     | NAP, hours, map/directions, form                                                                       |
| `/privacy`     | Footer only | Privacy policy (form data)                                                                             |
| `/terms`       | Footer only | Terms of use                                                                                           |
| `/sitemap.xml` | —           | Generated XML sitemap (SEO). Do **not** add a public HTML `/sitemap` page.                             |
| `/robots.txt`  | —           | Allow `/`, point `Sitemap:` at `/sitemap.xml`                                                          |
| `not-found`    | —           | 404                                                                                                    |

**Header nav (exactly four):** Home `/`, Services `/services`, About `/about`, Contact `/contact`. Never put Privacy, Terms, or sitemap in the header.

**Footer:** those four links + Privacy + Terms. Optional **View on RadiatorRepairHub** if `seo.rrhListingUrl` is set.

**Get a quote** always goes to `/contact` (not `#contact`), including from the home hero.

XML sitemap URLs: `/`, `/services`, `/about`, `/contact`, `/privacy`, `/terms`.

### Home section IDs

On `/` only, for skip and in-page jumps. Sticky header: `scroll-margin-top` = header stack + 16px.

| ID          | Section                                                     |
| ----------- | ----------------------------------------------------------- |
| `#top`      | Skip target wrapping UtilityHeader                          |
| `#services` | Services preview                                            |
| `#about`    | About teaser                                                |
| `#reviews`  | Reviews                                                     |
| `#gallery`  | Gallery (omit if disabled)                                  |
| `#hours`    | Hours & location teaser                                     |
| `#contact`  | Contact teaser (still link primary quote CTA to `/contact`) |

---

## 5. Locked chrome copy

Do not paraphrase these in the UI. Shop-specific sentences live in JSON (`hero`, `about.mission`, service blurbs).

| UI                       | Copy                                                       |
| ------------------------ | ---------------------------------------------------------- |
| Nav                      | Home, Services, About, Contact                             |
| Primary button           | `Call {phoneDisplay}`                                      |
| Secondary button         | Get a quote                                                |
| Directions               | Get Directions                                             |
| Reviews CTA              | View all on Google                                         |
| Form submit              | Send message                                               |
| Form success             | Thank you for contacting us, we'll get back to you soon!   |
| Form error               | Couldn't send. Call the shop or try again.                 |
| Form privacy             | We'll never share your info. Prefer to talk? Just call us. |
| Skip link                | Skip to content                                            |
| Back to top `aria-label` | Back to top                                                |
| Sticky bar               | same as primary: `Call {phoneDisplay}`                     |
| Open badge               | Open now - closes {end}                                    |
| Closed badge             | Closed now                                                 |
| Directions new tab       | `rel="noopener noreferrer"`                                |
| Google reviews new tab   | `rel="noopener noreferrer"`                                |
| RRH button               | View on RadiatorRepairHub                                  |
| RRH new tab              | `rel="noopener noreferrer"`                                |
| Footer legal             | Privacy, Terms                                             |
| 404 heading              | Page not found.                                            |
| 404 body                 | That page isn’t on this shop site.                         |

### Section chrome (eyebrow + heading)

| Section             | Eyebrow          | Heading                                                           |
| ------------------- | ---------------- | ----------------------------------------------------------------- |
| Services            | What we fix      | Services                                                          |
| FAQ (services page) | Common questions | Before you bring it in                                            |
| About               | Why us           | About                                                             |
| Reviews             | Google reviews   | What customers say                                                |
| Gallery             | From the shop    | Gallery                                                           |
| Hours               | Visit            | Hours & location                                                  |
| Contact             | Quote            | Get a quote                                                       |
| Final CTA (minimal) | —                | Need radiator repair today?                                       |
| Final CTA (heavy)   | —                | Use `hero.headline` if short; else “Ready to get it cooled down?” |

If `reviews.rating` and `reviews.count` exist, reviews subline: `{rating} stars from {count} Google reviews` (e.g. `4.9 stars from 86 Google reviews`).

---

## 6. Form contract

Fields, in order:

| Field              | `name`    | Required | Autocomplete |
| ------------------ | --------- | -------- | ------------ |
| Name               | `name`    | yes      | `name`       |
| Phone              | `phone`   | yes      | `tel`        |
| Email              | `email`   | no       | `email`      |
| Service            | `service` | yes      | —            |
| Vehicle model      | `vehicle` | yes      | `off`        |
| Describe the Issue | `issue`   | yes      | `off`        |

- Service options are `services[].title`. Omit the dropdown when `services` is empty.
- `action={contact.formAction}` if set (POST). Else `mailto:{shop.email}` with `subject` = `Quote request - {shop.name}` and body from the fields.
- Do not use `Submit` as the button label.
- After success: replace the form with the success sentence + `Call {phoneDisplay}` link. After error: inline error text above the button; keep field values.

---

## 7. Empty, omit, and 404

Omit the UI — no empty boxes, no “N/A”.

| Missing                                   | Behavior                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `brand.logoPath` empty or file missing    | Typeset `shop.name` in display weight                                                                |
| `hero.secondaryCta` omitted               | Primary Call only (minimal already emphasizes Call; heavy still prefers two — add secondary in JSON) |
| `reviews.googleUrl` empty                 | Hide “View all on Google”                                                                            |
| `reviews.items` empty                     | Hide entire reviews section                                                                          |
| `gallery.enabled` false or `images` empty | Omit `#gallery`                                                                                      |
| All `contact.socials` empty               | Hide social row                                                                                      |
| `location.embedUrl` empty                 | Directions link only; never a broken iframe                                                          |
| No `about.yearsInBusiness`                | Hide “Est. {year}” eyebrow bits that need it                                                         |
| `seo.rrhListingUrl` empty                 | Hide **View on RadiatorRepairHub** everywhere                                                        |
| `faq` empty or omitted                    | Hide FAQ section and FAQPage JSON-LD on `/services`                                                  |

**404:** Same header/footer as the site. Heading: “Page not found.” Body: “That page isn’t on this shop site.” Actions: Home (`/`) and `Call {phoneDisplay}`. No illustrations.

---

## 8. Metadata, NAP, local SEO, and JSON-LD

### Per-page head

Every HTML route sets:

- `<title>` and `<meta name="description">` from `seo.pages.*` or the fallback table in §1
- `<link rel="canonical">` = origin + pathname
- `og:title`, `og:description`, `og:url`, `og:type` (`website`), `og:image` (absolute)
- `twitter:card` = `summary_large_image` when OG image exists
- Optional `<meta name="keywords">` from `seo.keywords` joined by commas — **not used for ranking**; do not invent keyword stuffing
- Favicon: `seo.favicon` or `/favicon.ico`
- Do **not** put “RadiatorRepairHub” in `<title>` on client sites (the RRH button is the directory link)

### NAP (on-site citations)

Name, address, and phone must be **byte-identical** everywhere they appear (utility header, footer, contact, about, JSON-LD).

```
{shop.name}
{shop.address}
{shop.city}, {shop.state} {shop.zip}
{phoneDisplay}
```

- Address text links to Google Maps using `location.placeId` when set (`query_place_id`); otherwise `location.googleMapsUrl`
- Phone is always `tel:` + display string from §3
- Do not abbreviate `Street` vs `St` in one place and not another — JSON is the only source

Off-site citations (Google Business, RRH listing `website` field) are launch ops, not template pages. GBP NAP must match this block.

### Local SEO (on-page)

- City and state in home H1 / `hero.headline` and in per-page titles
- Service names from JSON on `/` and `/services`
- `location.serviceAreas` on `/` (heavy) and `/contact` or `/about` when shown
- Hours in visible HTML, not only schema

### JSON-LD (all pages, in `layout`)

Graph:

1. **`AutoRepair`**:
   - `name`, `image` (og or hero), `url` (canonical origin), `telephone` (E.164 `+1…`), `email`
   - `address`: `PostalAddress` (`streetAddress`, `addressLocality`, `addressRegion`, `postalCode`, `addressCountry`: `US`)
   - `geo`: `GeoCoordinates` when `lat` / `lng` set
   - `openingHoursSpecification` parsed from `hours`
   - `sameAs`: `seo.rrhListingUrl`, `location.googleMapsUrl`, `reviews.googleUrl`, plus every non-empty `contact.socials` URL
   - `areaServed` from `serviceAreas` when present
2. **`WebSite`**: `name`, `url`
3. **`BreadcrumbList`** on inner pages: Home → current page name
4. **`FAQPage`** on `/services` only when `faq[]` has items (visible Q&As)

Do not emit a second conflicting NAP in schema.

### Legal page body (short)

**Privacy:** We use the contact form (name, phone, optional email, service, vehicle, and issue description) only to return quotes and calls. We do not sell it. Repeat NAP. No analytics. If a Google map is embedded, say Google may set cookies when that map loads.

**Terms:** This site is information about `{name}`. Quotes and work are between you and the shop. The website template host is not the repair shop. Repeat NAP.

---

## 9. Folder map (each template app)

```
{template}/
  DESIGN.md
  content/demo.json
  public/
    favicon.ico
    images/demo/          # hero, gallery, logo, og.jpg
  src/
    app/
      layout.tsx
      page.tsx
      services/page.tsx
      about/page.tsx
      contact/page.tsx
      privacy/page.tsx
      terms/page.tsx
      sitemap.ts
      robots.ts
      not-found.tsx
      globals.css
    components/
      UtilityHeader.tsx
      SiteHeader.tsx
      Hero.tsx
      TrustStrip.tsx
      ServiceCard.tsx
      ServiceGrid.tsx
      AboutSection.tsx
      ReviewsSection.tsx
      GalleryGrid.tsx
      HoursLocation.tsx
      ContactForm.tsx
      ContactSection.tsx
      FinalCta.tsx
      SiteFooter.tsx
      StickyCallBar.tsx
      BackToTop.tsx
      RrhLink.tsx         # View on RadiatorRepairHub; omit if no URL
    lib/
      config.ts           # load + type ShopConfig
      phone.ts            # tel href + display
      hours.ts            # format + open/closed
      seo.ts              # titles, NAP, JSON-LD, sameAs
```

Client clone: rename `content/demo.json` or add `content/{client}.json` and point `config.ts` at it; photos in `public/images/{client}/`.

CSS variables (both templates, values differ): `--bg`, `--surface`, `--ink`, `--ink-muted`, `--line`, `--accent`, `--accent-ink`, `--hero-scrim`. Heavy also `--band`, `--band-ink`, `--line-band`. `--accent` is assigned from `brand.accentColor` on `<html>`.

---

## 10. Icon set

**Library:** [Lucide](https://lucide.dev) only. Stroke **1.5**, size **24px** in cards / utility, **20px** in the utility header. Color `currentColor` (`ink` or `band-ink`). No 3D, no emoji icons, no mixed icon fonts.

Allowed `services[].icon` values (string = Lucide name):

| JSON `icon`   | Lucide      | Typical use               |
| ------------- | ----------- | ------------------------- |
| `thermometer` | Thermometer | Overheating / radiator    |
| `refresh-cw`  | RefreshCw   | Recore                    |
| `droplets`    | Droplets    | Flush                     |
| `snowflake`   | Snowflake   | A/C                       |
| `flame`       | Flame       | Heater cores              |
| `truck`       | Truck       | Fleet                     |
| `wrench`      | Wrench      | Diagnostics / general     |
| `gauge`       | Gauge       | Pressure / cooling system |

If `icon` is missing or not in this table, render the card with **no icon** (not a random fallback).

Utility header: Phone (`phone`), Mail (`mail`), MapPin (`map-pin`), Clock (`clock`). Socials: official simple SVGs or Lucide `facebook` / `instagram` / `youtube` only when the URL exists.

---

## 11. Shared breakpoints and controls

Templates may differ in max-width and type size; they **must** share these so clones feel like one kit.

| Token                  | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| Breakpoint `md`        | 768px — sticky call bar `display: none` from here up        |
| Breakpoint `lg`        | 1024px — two-column about / contact / split hero            |
| Spacing scale          | 4, 8, 12, 16, 24, 32, 48, 64, 72, 88 px                     |
| Button height          | 48px (44px min on mobile is the tap target; 48px preferred) |
| Button padding-x       | 20px                                                        |
| Button radius          | 2px                                                         |
| Focus ring             | 2px solid `var(--accent)`, offset 2px                       |
| Logo in nav            | max-height 40px, width auto                                 |
| Utility header         | max-height ~40px content; small type 14px                   |
| Sticky call bar height | 56px; `padding-bottom` on `body` at `< md` = 56px + 8px     |
| Back to top            | 44×44px; mobile bottom offset 56px + 12px                   |
| Hash offset            | `scroll-margin-top`: 72px mobile, 96px desktop (sticky nav) |

**Z-index:** content `1`, sticky header `20`, sticky call `30`, back-to-top `40`, skip-link `50`.

---

## 12. Interaction states (shared)

| Element             | Hover                          | Focus                   | Active      |
| ------------------- | ------------------------------ | ----------------------- | ----------- |
| Primary button      | Darken accent ~10%             | Focus ring              | Darken ~16% |
| Secondary / outline | Background `ink` at 6% opacity | Focus ring              | 10%         |
| Text links          | Underline; accent color        | Focus ring              | —           |
| Cards (minimal)     | Border `ink` at 20%; no lift   | Focus ring if clickable | —           |
| Cards (heavy)       | TranslateY(-2px); no glow      | Focus ring if clickable | —           |
| `tel:` links        | Accent                         | Focus ring              | —           |

`prefers-reduced-motion: reduce`: no translate, no smooth scroll, no carousel animation (instant snap), **no page transitions**.

---

## 14. Page transitions

- Default: View Transitions API or a **150–200ms opacity** fade between routes.
- Minimal template: fade only. Heavy may use the same fade (no slide, no overlay loader).
- Do not animate the sticky call bar or `tel:` navigation.
- Skip entirely when `prefers-reduced-motion: reduce`.
- Must not delay LCP (no full-screen branded splash).

---

## 15. View on RadiatorRepairHub

- Label: **View on RadiatorRepairHub** (SCHEMA §5).
- `href` = `seo.rrhListingUrl`. `target="_blank"` + `rel="noopener noreferrer"`.
- Placement: `/about` (near mission) and footer. Optional on `/contact` next to NAP.
- Hide when URL is missing. Never use another shop’s RRH listing on a client or demo that claims a different NAP.
- RadiatorRepairHub is [radiatorrepairhub.com](https://radiatorrepairhub.com/). No RRH logo in the header; this text link is the only RRH chrome.

---

## 13. Imagery aspect ratios

| Use               | Ratio                       | Object-fit            |
| ----------------- | --------------------------- | --------------------- |
| Minimal hero      | Full-bleed, min-height 70vh | `cover`, focal center |
| Heavy split photo | 4:3                         | `cover`               |
| About inset       | 4:3                         | `cover`               |
| Gallery           | 4:3                         | `cover`               |
| OG image          | 1200×630 (1.91:1)           | —                     |
| Logo              | intrinsic; cap 40px tall    | —                     |
