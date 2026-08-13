# RadiatorRepairHub Design System

Calm consumer directory. Clean, minimal, blue. The site should feel still,
trustworthy, and easy to scan — never like a marketing template.

## Color

Blue is the only brand accent. Use tokens, never raw Tailwind palette classes.

| Role        | Hex       | Token / class                          |
| ----------- | --------- | -------------------------------------- |
| Primary ink | `#1B4F72` | `--primary` → `bg-primary`             |
| Interactive | `#2B6A9F` | `--interactive` → `text-interactive`   |
| Tint        | `#E8F1F7` | `--tint` → `bg-tint`                   |
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
- Page H1: `text-3xl md:text-4xl font-bold`
- Section H2: `text-3xl font-semibold`
- Card/sub H3: `text-lg font-semibold`
- Body: weight 400, muted text uses `text-muted-foreground`

## Shape and surfaces

- Radius: `0.5rem` everywhere (`rounded-lg`). No `rounded-2xl`/`rounded-xl` chrome.
- One surface recipe: `bg-card border border-border rounded-lg`
- Borders over shadows. `shadow-sm` at most (dropdowns/popovers may use `shadow-md`).
- No `border-2` input chrome, no `border-t-5` / `border-l-4` accent stripes.

## Buttons

Two styles only:

- Filled: `bg-primary text-primary-foreground hover:bg-primary/90`
- Outline/text: `border border-border text-foreground hover:bg-muted`
  (or a plain `text-interactive` link)

Never invert a chip or outline button to solid blue on hover.

## Motion

Color and opacity transitions only.

- No hover lift (`hover:-translate-y-*`), no scale (`hover:scale-*`)
- No animated gradients, floating icons, or ambient decoration
- Respect `prefers-reduced-motion`
- The existing listing-card 3D flip is allowed (it is interaction, not decoration)

## Signature

The search field is the one memorable element — homepage hero and listing
pages. Everything around it stays quiet. Do not add a second "wow" element.

## Anti-patterns (do not reintroduce)

- Tailwind `blue-600` / `blue-500` / `gray-50` / `gray-900` classes — use tokens
- `shadow-lg` cards with hover lift
- Floating Lucide icons or blur orbs in heroes
- Rainbow icon-in-colored-box grids
- Inter or Oswald fonts
- Three equal CTAs in a row — one primary, rest text links
