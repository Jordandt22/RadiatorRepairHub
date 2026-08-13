# RadiatorRepairHub Design System

Quiet-premium consumer product with workshop atmosphere. Trustworthy and
easy to scan — but not limited to a stiff “directory” look. Consumer-app
and SaaS product patterns are welcome when they serve clarity and presence.

## Color

Blue is the only brand accent. Use tokens, never raw Tailwind palette classes.

| Role        | Hex       | Token / class                          |
| ----------- | --------- | -------------------------------------- |
| Primary     | `#1E6BB8` | `--primary` → `bg-primary`             |
| Interactive | `#3B82C4` | `--interactive` → `text-interactive`   |
| Tint        | `#E3F0FA` | `--tint` → `bg-tint`                   |
| Page        | `#F7F9FB` | `--background` → `bg-background`       |
| Surface     | `#FFFFFF` | `--card` → `bg-card`                   |
| Text        | `#1A2332` | `--foreground` → `text-foreground`     |
| Muted text  | `#5C6B7A` | `--muted-foreground`                   |
| Border      | `#D5DEE6` | `--border` → `border-border`           |

Semantic colors (not brand): quiet green for open/verified, red for
closed/errors, amber only for true warnings. Never use emerald, purple,
orange, or yellow as decoration (no rainbow icon boxes).

## Type

One family: **IBM Plex Sans** (`--font-sans`, also `--font-heading`).
No second display face.

- Headings: weight 600–700, `tracking-tight` on large sizes
- Page H1: `text-3xl md:text-4xl font-bold` (home hero may go larger)
- Section H2: `text-3xl font-semibold`
- Card/sub H3: `text-lg font-semibold`
- Body: weight 400, muted text uses `text-muted-foreground`
- Home section headers: centered by default
- Section intros: `text-base md:text-lg` so H2 stays dominant
- Prefer one inline link in intros; primary actions use the section CTA button

## Shape and surfaces

- **Buttons / search / primary CTAs:** `rounded-full` (pill)
- **Cards / panels / tiles:** `rounded-lg`
- One surface recipe: `bg-card border border-border rounded-lg`
- Borders over shadows. `shadow-sm` at most (dropdowns/popovers may use `shadow-md`).
- No `border-2` input chrome, no `border-t-5` / `border-l-4` accent stripes.

## Buttons

Two styles only; always pill-shaped:

- Filled: `bg-primary text-primary-foreground hover:bg-primary/90 rounded-full`
- Outline/text: `border border-border text-foreground hover:bg-muted rounded-full`
  (or a plain `text-interactive` link)

Never invert a chip or outline button to solid blue on hover.

## Nav

- **Home** (direct), **Browse** ▾ (Featured, Categories, States),
  **Resources** ▾ (Blogs, Shop, How to Claim, FAQ), **About**, **Contact**,
  Search CTA, account
- Logo also links Home. Short text dropdowns only — no mega-menus.
- Prefer a solid light bar on interior pages. On home only, use a transparent
  bar over the hero (`bg-transparent`) with light text.

## Motion

Prefer color, opacity, and height for interaction (e.g. FAQ expand).

- No hover lift (`hover:-translate-y-*`), no decorative scale
- No animated gradients, floating icons, or ambient decoration
- Respect `prefers-reduced-motion` (instant open/close when reduced)
- Listing-card 3D flip and FAQ accordion motion are allowed (interaction)

## Signature

Home: full-bleed atmospheric shop photo with dark overlay; tall first
viewport (`min-h-[80svh]`) with nav overlaid; centered headline, pill search,
and popular-state chips. Listing/search pages: navy `PageHeader` (same
signature band as How It Works, not `bg-primary` slabs); pill search, sort,
and filter controls; result count above the grid. Do not add a second hero
photo below the fold.

Restrained flair is allowed: step numbers, tint icon wells (same icon OK for
state rows), stronger hover borders, soft section atmosphere (radial wash +
grain on Featured / Popular States), and one signature dark band (How It Works).
Still no rainbow icon boxes, lift, or glow.

## Anti-patterns (do not reintroduce)

- Tailwind `blue-600` / `blue-500` / `gray-50` / `gray-900` classes — use tokens
- `shadow-lg` cards with hover lift
- Floating Lucide icons or blur orbs as decoration
- Rainbow icon-in-colored-box grids
- Inter or Oswald fonts
- Three equal CTAs in a row — one primary, rest text links
- Solid `bg-primary` hero slabs (use photo + overlay instead)
