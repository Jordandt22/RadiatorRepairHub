# Heavy Template — Design Spec

Build spec for the richer, trust-heavy auto / radiator shop site. Implement this document; do not invent extra pages, skins, or marketing variants.

**Related spec:** [`../minimal_template/DESIGN.md`](../minimal_template/DESIGN.md) — quieter skin, same contracts.

**Shared contracts (do not fork):** [`../shared/SCHEMA.md`](../shared/SCHEMA.md) — JSON schema, section IDs, chrome copy, phone/hours, form, SEO, folder map, icons, breakpoints.

**Demo data:** [`content/demo.json`](content/demo.json)

---

## 1. Overview

### Purpose

A professional shop website for radiator repair shops and general automotive shops that currently have no site. The visitor’s job is to **call the shop**. Secondary job: request a quote.

This template is the heavier of two skins: more photography, more trust chrome, a **near-black page**, larger type. Same sections as the minimal template. Sell the outcome: **Call Now + a site that looks established.** Do not sell “minimal vs heavy” or “light vs dark.”

Density ceiling: [graceautomotive.com](https://graceautomotive.com/) completeness and [cartimeautomotive.com](https://cartimeautomotive.com/) split hero — **not** the full length of [crowntowing-repair.com](https://crowntowing-repair.com/) (no 20-section homepage).

### Target shop

- Shop with real bay photos and a Google rating worth showing
- Radiator specialist or full-service auto with cooling as a lead service
- Comfortable with a bolder first impression for outreach demos

### Primary conversion

Phone call (`tel:`). Quote / contact form is secondary but visible in the hero (dual CTA).

### Relationship to minimal template

| Axis | Minimal template | This template |
|------|------------------|---------------|
| Visual weight | Light page, quiet, one accent | **Near-black page**, larger type, more trust chrome |
| Header | Phone + address | Phone + email + address + hours |
| Hero | Full-bleed, Call emphasized | Split or full-bleed, dual CTAs + trust pills |
| Services on home | 4 cards, short blurbs | 6–8 cards, symptom-style copy |
| Reviews | 2–3 static quotes + Google link | 3+ quotes, carousel-ready |
| Gallery | Off by default | On by default in demo |
| Map | Directions link only | Embedded map + service-area list |
| Back to top | Off by default | On |

JSON shape is identical. Differences are **what you render by default** and **how it looks**.

### Reference sites

- [graceautomotive.com](https://graceautomotive.com/) — utility bar (phone, address, hours), dual hero CTAs, trust stats, live-reviews *layout* (we use static quotes + Google link in v1), why-us grid, map + directions, final CTA, back to top.
- [cartimeautomotive.com](https://cartimeautomotive.com/) — split hero (copy left, bay photo right), trust pills under headline, appointment form fields as a model for an optional richer form (v1 still uses the shared short form).
- [crowntowing-repair.com](https://crowntowing-repair.com/) — stats block, work gallery, review density. Use as a **ceiling**, not a length target.
- [mcleodautosales.com/service.aspx](https://www.mcleodautosales.com/service.aspx) — location card near hero, service grid, closing CTA band. Skip dealer mega-nav.
- [jax24mobilesemitruckrepair.com](https://www.jax24mobilesemitruckrepair.com/) — call-first red/navy urgency. Borrow dual CTA and phone pill, not 24/7 emergency chrome unless the shop is actually emergency.

Do not copy coupon downloads, blogs, financing widgets, or insurance FAQs unless a specific client pays for them (out of scope for the kit).

---

## 2. Design principles

### Subject

A working radiator / auto shop at full presence: open hoods, cores, pressure testers, wet floors, dusk shop signs. The hero thesis is **the bay in use** plus **shop name** — proof they exist, then the phone.

### Atmosphere

A lit bay at night. **Near-black page by default** — this template is dark-dominant, not a light page with dark bands (that is the minimal template's job). The page and every full-width band share one black, `#141414`. Cards sit one step lighter (`#1C1C1C`) so they still separate from that floor. Type is warm off-white, not cool gray-blue. Enamel red is the only color.

Do not add a light section to “break up” the dark. Contrast comes from photography, red CTAs, and the raised cards.

### Texture (locked)

Two surface treatments, each in exactly one place. Stacking both on every section reads as a kit of effects rather than a design.

| Texture | Where | How |
|---------|-------|-----|
| Grid lines | Home services band **only** | `.grid-lines`, 4rem repeating hairlines at 5% ink |
| Faded photo | `PageBanner` and `PageCta` only | Hero image at 30–35% under a black gradient |

No cursor effect. Smooth scrolling via `scroll-behavior`, disabled with reduced motion.

If `brand.accentColor` is set (e.g. client blue), it replaces CTA/accent only; bands stay charcoal, not a rainbow.

### What this page must do in three seconds

1. Name of the shop  
2. What they fix (one line)  
3. How to call **and** that they are established (rating / years in the same view)

### Anti-patterns (do not ship)

- Cream + terracotta + serif “lifestyle” look  
- Acid green / electric vermilion / any second accent — the page is dark, but red is the only colour  
- A light section, or white cards floating on the dark page  
- Cool navy borrowed from the minimal template (`#1A2330`, `#274C77`)  
- Dense newspaper / broadsheet columns  
- Generic stock imagery  
- Pricing tables, gift certificates, blog, financing as default kit  
- Copy that says “template,” “heavy,” or “light/dark mode”  
- Numbered 01 / 02 / 03 **except** in About if you ship the optional 4-step process (see 5.6) — only then, because order is a real sequence  

### Motion

Restrained. Card hover lift (2px), button hover, plus a 150–200ms route fade (SCHEMA §14). Optional fade-in on section enter. Two scripted pieces: the **hero marquee** (CSS loop) and the **TrustStrip count-up** (`IntersectionObserver`, numeric values only, final value in the server HTML). No auto-rotating hero slider (Grace/Enterprise carousels are a skip). Review carousel: user-controlled only, not autoplay.

Under `prefers-reduced-motion`: no smooth scroll, no route fade, no card lift, marquee static and centred, stats showing their final values.

### Accessibility floor

- Visible keyboard focus on all interactive elements  
- Tap targets ≥ 44×44px  
- Contrast: body uses `ink` / `ink-muted` on `bg` / `sunken` / `surface`. `ink-muted` (`#A8A8A4`) holds 4.5:1 on `#141414`  
- `color-scheme: dark` so native selects, scrollbars, and autofill render dark  
- Hero: scrim or solid panel behind type so photo never eats the headline  
- Skip-to-content  
- Carousel: previous/next buttons, not swipe-only; pause if any motion  
- Map iframe: title attribute, adjacent text alternative (address + directions link)  

---

## 3. Visual system

### Color tokens

Dark default. Red, black, white — nothing else earns a slot. Neutrals are warm asphalt, not the cool navy-gray of the minimal template.

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#141414` | Page background |
| `sunken` | `#141414` | Utility header, footer, trust, reviews, gallery, photo bands (same black as the page) |
| `surface` | `#1C1C1C` | Cards, form fields, chips, marquee — one step above the page |
| `surface-raised` | `#242424` | Nested fills / hover |
| `ink` | `#F5F5F4` | Headings and body |
| `ink-muted` | `#A8A8A4` | Secondary copy (4.5:1 on `bg`) |
| `line` | `#2A2A2A` | Hairlines and card borders |
| `accent` | `#E31B16` | Primary CTAs, phone, icon tiles, trust labels (override with `brand.accentColor`) |
| `accent-hover` | `#FF2D24` | Brightens on dark, rather than darkening |
| `accent-soft` | `#3D3D3D` | Empty stars only |
| `highlight` | `#FF3B30` | Filled stars |
| `accent-ink` | `#FFFFFF` | Text on accent |
| `hero-scrim` | `rgba(0, 0, 0, 0.72)` | Photo bands |

`accent` is warning-label red — bright enough to read on black, short of neon. Maroon `#B42318` from the first spec goes muddy here. `brand.accentColor` in JSON is injected inline on `<html>` and **overrides this token**, so a client's accent must also be checked against near-black. If the client's brand is blue, swap `accent` only and leave the neutrals alone.

**Contrast floor:** body uses `ink`/`ink-muted`, never a dimmer gray.

### Typography

Display with more character than minimal; body stays workhorse.

| Role | Face | Weights | Notes |
|------|------|---------|--------|
| Display | **Barlow Condensed** | 600, 700 | Wide shop-sign energy; used for H1/H2 only |
| Body / UI | **Source Sans 3** | 400, 600 | Readable paragraphs and nav |
| Data (hours, stats, phone) | **Source Sans 3** | 600 | `font-variant-numeric: tabular-nums` |

**Scale (desktop)**

| Step | Size | Line height | Use |
|------|------|-------------|-----|
| Display | 3.25rem (52px) | 1.05 | Hero H1 — larger than minimal |
| H2 | 2.25rem (36px) | 1.15 | Section titles |
| H3 | 1.25rem (20px) | 1.25 | Card titles |
| Body | 1.0625rem (17px) | 1.55 | Paragraphs |
| Small | 0.875rem (14px) | 1.4 | Utility header, captions |

Mobile: Display 2.25rem; body 16px.

Do not set body in Barlow Condensed.

### Layout

- Max content width: **80rem (1280px)** — slightly wider than minimal for split hero and 3–4 card rows  
- Horizontal padding: 1.25rem mobile, 2rem desktop  
- Section vertical rhythm: **5.5rem** desktop, **3.5rem** mobile  
- Cards: 2px radius, `surface` fill, hairline `line` border, no shadow (shadows do nothing on true black)  
- Buttons: 2px radius; primary = filled accent; secondary = outline ink. Two variants: `btnSecondary` (page), `btnSecondaryOnDark` (photo bands)  
- Alternate by tone, not by flipping to white: UtilityHeader (`sunken`) → Hero (`bg`) → Marquee (`surface`) → TrustStrip (`sunken`) → Services (`bg` + grid) → About (`bg`) → Reviews (`sunken`) → Gallery (`sunken`) → Hours + Contact (`bg`) → FinalCTA (`sunken` + photo) → Footer (`sunken`)

**Class-conflict rule:** never compose two utilities that set the same property. `card` bakes in `bg-surface`, so a card that needs its own fill uses `cardShell` instead; `btn` sets no border colour so each variant can set one. Tailwind resolves same-property collisions by stylesheet order, not by the order you wrote them, so the loser is effectively random.

Shared breakpoints, button height (48px), focus ring, z-index, logo cap (40px), sticky bar (56px), back-to-top offset, and hash `scroll-margin-top` are in [`../shared/SCHEMA.md`](../shared/SCHEMA.md) §11–13. This template’s content width stays **80rem**.

**Letter-spacing:** Barlow Condensed display `-0.02em`. Source Sans body `0`. Buttons `0.02em`.

**Hero image (split):** 4:3, `object-fit: cover`. Full-bleed fallback: min-height 70vh + scrim.

### Interaction states (this template)

Follow SCHEMA §12. Cards: `translateY(-2px)` on hover; no glow, no neon shadow. Review carousel: user-controlled only. `prefers-reduced-motion`: instant snap, no lift.

### Signature

**The shop-sign marquee** directly under the hero: service names, city, and “Since {year}” looping across a charcoal band in Barlow Condensed caps, separated by small accent diamonds. It is the one bold element on the page — everything around it stays disciplined. Decorative, so the strip is `aria-hidden`; every word also appears in the hero eyebrow or the services grid.

The phone is still the loudest control (accent fill).

### Wireframes

**Header (desktop)**

```
+--------------------------------------------------------------------------------+
|  (tel) 555-0100   shop@...   123 Shop Rd, City ST   Mon–Fri 8–5  Sat 8–12     |
+--------------------------------------------------------------------------------+
|  [LOGO]     Home  Services  About  Contact                    [ Call ]         |
+--------------------------------------------------------------------------------+
```

Utility row: phone, email (`mailto:`), address (Maps link), compact hours (today or Mon–Sat one-liner). Main nav: logo, four links, Call button (accent).

**Hero — split (preferred)**

```
+----------------------------------+-----------------------------------+
|  [ Open now - closes 5:30 PM ]   |                                   |
|  CITY · EST. YEAR                |     [ bay / shop photo ]          |
|  HEADLINE                        |                                   |
|  One line of what they fix       |                                   |
|                                  |                                   |
|  [ Call 555-0100 ] [ Get a quote]|                                   |
|  ★★★★★ 4.9 stars from 86 reviews |                                   |
+----------------------------------+-----------------------------------+
```

**No trust pills.** The TrustStrip sits immediately below with four stats; pills would state the same facts twice. The one line under the CTAs is the Google rating, linking to `#reviews`, and it is the **only** place the rating appears on the home page — the strip carries years / honesty / turnaround / fleet instead.

The open/closed badge lives here and nowhere else. The utility bar shows plain hours text.

Photo is real work, rounded 2px — not a floating 3D mock.

**Hero — full-bleed (fallback)** if only one wide photo: same copy left over scrim; still show dual CTAs + pills. Split is the default for this template.

**Mobile sticky call bar**

```
+------------------------------------------+
|           [ Call 555-0100 ]              |
+------------------------------------------+
```

Same behavior as minimal: fixed bottom, accent, pad body, hide at `md+`.

**Back to top**

```
                         [^]
```

Bottom-right, 44px, sits above sticky bar on mobile (~4.5rem offset).

---

## 4. Page map

Required routes and footer legal pages: SCHEMA §4. **Header nav is four links to real URLs**, not home hashes.

| Route | Role |
|-------|------|
| `/` | Landing — section stack below |
| `/services` | Full service list (all JSON items) |
| `/about` | Full about + View on RadiatorRepairHub |
| `/contact` | NAP, hours, map, form |
| `/privacy` | Footer |
| `/terms` | Footer |
| `/sitemap.xml` | Generated; not in nav |
| `/robots.txt` | Generated |

**Get a quote** → `/contact`. Chrome copy: SCHEMA §5.

Canonical home order:

1. UtilityHeader  
2. MainNav  
3. Hero  
4. Marquee (signature)  
5. TrustStrip  
6. Services (preview, first 6–8; cards link to `/services#{slug}`, last tile is the Ask-a-tech card)  
7. About / Mission teaser (link to `/about`)  
8. Reviews  
9. Gallery (if `gallery.enabled`)  
10. HoursLocation + service-area chips + Contact teaser  
11. FinalCTA (`PageCta`)  
12. Footer (brand + services + hours + nav, Reviews link, Privacy + Terms + RRH if set)  
13. MobileStickyCall  
14. BackToTop — **on** (default `features.showBackToTop` true)

**Every route** ends in a `PageCta` band with the phone: home, services, about, contact, privacy, terms, and 404. Inner routes open with a `PageBanner` (breadcrumbs, title, one line, call button).

---

## 5. Section spec

Unless noted, content comes from `content/{client}.json`. Layout variant here is **heavy**.

### 5.1 UtilityHeader

- **JSON:** `shop.phone`, `shop.email`, address fields, `hours`  
- **Show:** phone (`tel:`), email (`mailto:`), address (`location.googleMapsUrl`), hours summary (e.g. “Mon–Fri 8–5 · Sat 8–12” or “Open today until 5:30 PM” if `hours.timezone` set)  
- **Mobile:** phone + “Hours” on first row; address/email can wrap or hide email behind a text link  
- **A11y:** `aria-label="Shop contact"`  

### 5.2 MainNav

- **JSON:** `shop.name`, `brand.logoPath`  
- **Links:** Home `/`, Services `/services`, About `/about`, Contact `/contact`  
- **CTA:** Call (`tel:`) accent button  
- **Mobile:** hamburger; **Call remains in the bar**  
- **Sticky:** MainNav sticky; utility bar may collapse on scroll  

### 5.3 Hero

- **JSON:** `hero.*`, `shop.city`, `about.yearsInBusiness` for the eyebrow, `reviews.rating` / `reviews.count` for the rating line  
- **Layout:** split 50/50 desktop; stack photo below copy on mobile (photo still large — min ~40vh)  
- **Eyebrow:** `{city} · Est. {years}` when years exist  
- **CTAs:** primary Call (accent); secondary Get a quote (`/contact`) equal visual weight except fill  
- **Open badge:** here only (`OpenBadge`, needs `hours.timezone`)  
- **Rating line:** stars + `{rating} stars from {count} Google reviews`, links to `#reviews`  
- **No** trust pills (see wireframe note), **no** service dropdown, **no** auto-rotating slides  

### 5.3a Marquee

- **JSON:** `services[].title`, `shop.city`, `about.yearsInBusiness`  
- **Layout:** charcoal band, hairline top and bottom, Barlow Condensed caps, accent diamond separators  
- **Behaviour:** CSS `translateX(-50%)` loop over two identical copies; `aria-hidden`; static and centred under reduced motion  

### 5.4 TrustStrip

- **JSON:** `trust[]` — render **first 4 items**  
- **Layout:** full-width `sunken` band, hairline top and bottom, four columns divided by vertical hairlines; **large numerals** (2.5rem+) in `ink` with accent labels beneath  
- **Mobile:** 2×2 grid  
- **Copy:** values like `32`, `100%`, `Same-day`, `Welcome` — keep labels short. **Do not** put the Google rating here; it is already under the hero  
- **Count-up:** `CountUp` animates only values that parse as a number, once on scroll. Non-numeric values render as plain text. Also used on `/about`  

### 5.5 Services

- **JSON:** `services[]` — render **first 6–8** on home (min 6 for demo)  
- **Layout:** 3-column desktop, 2-column tablet, 1 mobile. Grid-line texture on this band (home only)  
- **Card:** icon on a filled accent tile, title + **symptom or outcome blurb** (2–3 sentences allowed). Example: “Overheating on the highway or a sweet smell from the vents — we pressure-test, recore, or replace.”  
- **Last tile:** Ask-a-tech card in accent fill linking to `/contact` — inside the grid, not a separate row below it  
- **CTA:** card links to `/services#{slug}` when slug exists  
- **On `/services`:** no grid texture; each card gets a photo from `gallery.images` by index, and the section is preceded by `ServicesIntro`  

### 5.5a ServicesIntro (`/services` only)

One paragraph built from `shop.city`, `shop.state`, the service titles, and `about.bullets` as the sequence of a visit, closing on the phone number. One paragraph, written as prose — not a keyword block.  

### 5.6 About / Mission

- **JSON:** `about.mission`, `about.bullets` (up to 6), `yearsInBusiness`, `warranty`, `reviews.rating`  
- **Layout:** two column — story + photo, with the process sequence full-width beneath  
- **Proof row:** cards beside the story — Google rating (stars), years in `{city}`, warranty. The rating card appears on `/about` only; the home teaser drops it so the hero stays the single place the rating is stated  
- **Process:** if `about.bullets.length === 4` **and** they read as Drop-off → Diagnose → Approve → Fix, render as a numbered 4-step sequence. Otherwise an unnumbered grid — **do not number arbitrary marketing bullets**.  
- **Photo:** prefer a gallery or dedicated about image in the column  
- **RRH:** `RrhLink` if `seo.rrhListingUrl` set  
- **`/about` also** repeats the TrustStrip below the banner  

### 5.7 Reviews

- **JSON:** `reviews.items` (3+), `googleUrl`, `rating`, `count`  
- **Layout:** `sunken` band, hairline top and bottom, `surface` quote cards, outline `btnSecondary`  
- Heading includes rating + count (“4.9 stars from 120 Google reviews”)  
- **Quotes:** 3 visible; extra items sit in a **user-controlled** carousel (prev/next + page count). If only 3 items, no carousel chrome. The last page is clamped so it stays full rather than showing one lonely quote.  
- **CTA:** “Leave a Review” (accent) + “View all on Google” (outline). Footer and anything linking to the section use `/#reviews`  
- **v1:** static quotes only. Layout should not need a rewrite when a live widget is added later.  

### 5.8 Gallery

- **JSON:** `gallery.enabled`, `gallery.images`  
- **Default for demo:** `enabled: true` with 6–8 real-looking shop photos  
- **Layout:** 3-column mosaic or equal grid; 6 visible, “more” not required for v1  
- **Skip section** if disabled or empty  
- **Alt text** required per image  

### 5.9 HoursLocation

- **JSON:** `hours` (format: SCHEMA §3), `location.googleMapsUrl`, `location.embedUrl`, `location.serviceAreas`, shop address  
- **Show:** full hours table, address, **Get Directions**, **embedded map** when `location.embedUrl` is set **or** `features.embedMap` is true (default true on this template when embed URL exists)  
- **Service areas:** chip list or comma list from `serviceAreas[]` if present (default show when array non-empty; `features.showServiceAreas` default true)  
- **Open/closed badge:** if `hours.timezone` set, show near hours (client component)  
- **Fallback:** if no embed URL, same as minimal (directions link only) — do not show a broken iframe  

### 5.10 Contact

- **JSON:** `shop.*`, `contact.formAction`, `contact.socials`, `services[]` for the dropdown  
- **Layout:** one `ContactSection` with two columns. `variant="home"` puts hours first; the `/contact` variant puts the form first. The map renders once, inside the hours column.  
- **Form fields (SCHEMA §6):** Name, Phone, Email (optional), Service (select from `services[].title`), Vehicle model, Describe the Issue. Honeypot `company`. Vehicle and Service are **in v1**, not deferred.  
- **Submit:** `formAction` or `mailto:`. Button: **Send message**. Privacy line under the button.  
- **Socials:** show any provided  

### 5.11 FinalCTA (`PageCta`)

- **Copy:** SCHEMA Final CTA (heavy): `hero.headline` when ≤ 48 characters; else **Ready to get it cooled down?** Body line is per-route chrome (`ctaHome`, `ctaServices`, `ctaAbout`, `ctaContact`)  
- **CTAs:** Call + Get a quote  
- **Background:** `band` with the faded hero photo under a gradient; `accent` primary button  
- Repeat phone in text for scanners  
- Rendered on **every** route, including privacy, terms, and 404  

### 5.12 Footer

- Four columns: NAP + email + RRH, services list, hours table, links  
- Links column includes **Reviews** → `/#reviews`. The header nav stays four items — Reviews is not a fifth nav link  
- Repeat NAP (SCHEMA §8); phone as a button-sized link  
- Footer legal: Privacy `/privacy`, Terms `/terms`  
- **View on RadiatorRepairHub** if URL set  
- No RRH logo  

### 5.13 MobileStickyCall

- Viewport `< md`  
- `Call {phone}`  
- z-index above content; BackToTop above this bar  

### 5.14 BackToTop

- Default **on**. 44px control, `aria-label="Back to top"`, smooth scroll unless reduced motion (then instant).  

### Template differences (canonical)

| Section | minimal_template | heavy_template |
|---------|------------------|----------------|
| UtilityHeader | phone + address | phone + email + address + hours |
| Hero | Full-bleed, Call emphasized | Split; dual CTAs + open badge + rating line |
| Signature | — | Shop-sign marquee under the hero |
| TrustStrip | 3 stats, compact | 4 stats, large numerals, count-up |
| Services | 4 cards, short blurbs | 6–8 cards, icon tiles, Ask-a-tech tile, photos on `/services` |
| FAQ | static list | `details` accordion, first open |
| Reviews | 2–3 static + Google link | 3+ quotes, prev/next carousel |
| Gallery | off by default | on by default in demo |
| Map | directions link only | embed + service-area chips |
| BackToTop | off by default | on |

---

## 6. JSON config schema

**Do not duplicate the interface here.** Type, keys, phone/hours rules, form field `name`s, omit rules, and JSON-LD are in [`../shared/SCHEMA.md`](../shared/SCHEMA.md). Working example: [`content/demo.json`](content/demo.json).

### Heavy display rules

This template **defaults**:

- `features.showEmailInHeader`: true  
- `features.showHoursInHeader`: true  
- `features.showBackToTop`: true  
- `features.embedMap`: true when `location.embedUrl` is non-empty  
- `features.showServiceAreas`: true when `location.serviceAreas` is non-empty  
- Trust: 4 items; services: 6–8; reviews: 3+; gallery enabled in demo JSON  

`brand.theme` is written to `data-theme` on `<html>`; the demo is `"dark"`, which matches the default tokens. A light variant is not built and is not marketed.

---

## 7. Component inventory

| Component | Props (from config) | RSC vs client |
|-----------|---------------------|---------------|
| `UtilityHeader` | shop, hours, features, location.googleMapsUrl | Server (`hoursSummary` is static text) |
| `SiteHeader` | shop, brand | Client (mobile menu + active link) |
| `Hero` | hero, shop, about.yearsInBusiness | Server |
| `HeroCopy` | eyebrow, headline, sub, CTAs | Client (entrance stagger) |
| `GoogleRatingLine` | reviews.rating, reviews.count | Server |
| `Marquee` | services, shop.city, about.yearsInBusiness | Server (CSS animation) |
| `TrustStrip` | trust (slice 0–4) | Server |
| `CountUp` | one stat value | Client |
| `ServiceCard` | one service, optional image/href | Server |
| `ServiceGrid` | services (slice 0–8), gallery.images | Server |
| `ServicesIntro` | shop, services, about.bullets | Server |
| `ServicesFaq` | faq | Server (native `details`) |
| `AboutSection` | about, reviews.rating, optional image | Server |
| `ReviewsSection` | reviews | Server |
| `ReviewCarousel` | reviews.items | Client |
| `GalleryGrid` | gallery (slice 0–6) | Server |
| `ServiceAreas` | location.serviceAreas, features | Server |
| `ContactForm` | contact, shop, services | Client |
| `ContactSection` | wraps hours + form | Server wrapper |
| `PageBanner` | title, subtitle, hero image, shop | Server |
| `PageCta` | line, hero, shop | Server |
| `StarRow` | rating | Server |
| `OpenBadge` | hours.timezone | Client |
| `SiteFooter` | shop, hours, services, contact, seo.rrhListingUrl | Server |
| `RrhLink` | seo.rrhListingUrl | Server |
| `StickyCallBar` | shop.phone | Server |
| `BackToTop` | none | Client |

Layout sets CSS `--accent` from `brand.accentColor`.

---

## 8. CTA strategy

Labels and `tel:` formatting: SCHEMA §3 and §5. Primary is always `Call {phoneDisplay}`; secondary is always **Get a quote** → `/contact`. Form submit is **Send message**.

- **Minimum call surfaces:** UtilityHeader, MainNav, Hero, after Services (optional text link), HoursLocation, Contact details, FinalCTA, Footer, StickyCallBar  
- Hero always has **two** actions (Call + Quote). Do not add a third.  
- Visible call action roughly every 1.5 screens on mobile in addition to the sticky bar  

---

## 9. Imagery guidelines

**Required for a believable demo**

- Hero: interior bay or trucks at the door, people or work in frame if possible  
- Gallery: 6+ photos — cores, pressure tester, shop exterior, fleet van, heater core close-up — **real workshop**, not stock  

**Paths**

- Demo: `public/images/demo/`  
- Client clone: `public/images/{client}/`

**Avoid**

- Watermarked stock, AI neon garages, handshake photos  

**Alt text**

- Specific (“Iron Bay Radiator: recore on the bench, two copper tanks”)  

---

## 10. Demo profile

Fictional shop for outreach. **Canonical data:** [`content/demo.json`](content/demo.json) — Iron Bay Radiator & Cooling, Long Beach. Distinct from the minimal demo so side-by-side subdomains are not the same shop twice.

Demo host: `heavy.radiatorrepairhub.com`. Placeholder images: hero, 6 gallery files, logo, og under `public/images/demo/`. `seo.rrhListingUrl` points at the T P Auto Repair listing as a placeholder.

---

## 11. Demo and deployment

- This folder is a **Next.js app** (scaffold later). Clone into a client repo per shop.  
- Hosted package: Vercel from the client repo; you merge template upgrades manually for monthly clients.  
- One-time / self-host: freeze at handoff; keep static-export-friendly (form posts to `formAction` or `mailto:`, map is a public embed URL).  
- Launch checklist: site live → Google Business website + matching NAP → RadiatorRepairHub listing `website` field + `seo.rrhListingUrl` on this site.  
- Form backend is **not** chosen yet. Ship UI + `formAction` / `mailto:` only.

---

## 12. Explicitly deferred

- Client-facing admin / CMS  
- Live Google Reviews API (layout is ready for a widget swap)  
- Dark mode as a marketed feature  
- Blog, pricing, financing, coupons  
- Multi-tenant platform  
- Chat widgets  
- Crown-length FAQs, insurance legal modules, bilingual toggle  
- Custom cursor effect  
- Reference-site sections we are **not** copying: financing, blog, before/after “Then & Now”, live Google reviews widget, named “Meet the Crew” (needs per-client photo and name the schema does not carry), and a Services dropdown in the nav (the header stays four links)  

---

## 13. Metadata, 404, icons

- Head tags, NAP, JSON-LD (`AutoRepair` + `WebSite` + `BreadcrumbList`): SCHEMA §8.  
- Page transitions: SCHEMA §14.  
- 404: SCHEMA §7. Same header/footer, Call + Home.  
- Icons: Lucide only; use JSON `icon` when it is in the allowed set (SCHEMA §10).  
- Privacy line under the form: SCHEMA §5. Full policy at `/privacy`.  
- Folder map: SCHEMA §9. Map iframe: `title` = `{shop.name} location`.

## 14. Implementation notes for builders

1. Read [`../shared/SCHEMA.md`](../shared/SCHEMA.md) before coding tokens.  
2. Load [`content/demo.json`](content/demo.json); no hardcoded shop strings except locked chrome copy.  
3. Empty optional fields omit UI (SCHEMA §7).  
4. Test sticky call + back-to-top together on 375px; confirm `/contact` and hash sections clear sticky nav.  
5. Critique pass: the risk on a near-black page is generic dark SaaS. The cures are real bay photography, Barlow on headlines only, and enamel `accent` rather than neon. Do not add a light band to “fix” it.  
6. Textures are the locked set in §2. Do not stack the grid and the faded photo on one section.
