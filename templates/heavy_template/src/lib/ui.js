/** Shared Tailwind class strings for repeated patterns. */

export const wrap =
  "mx-auto w-full max-w-content px-gutter md:px-gutter-lg";

export const section =
  "py-section md:py-section-lg scroll-mt-header md:scroll-mt-header-lg";

/** Each variant sets its own border colour — the base must not, or the two
    border-colour utilities collide and the winner depends on CSS order. */
export const btn =
  "w-full md:w-auto inline-flex min-h-12 items-center justify-center px-5 py-2 rounded-btn text-base font-semibold tracking-[0.02em] no-underline border-2 cursor-pointer font-inherit touch-manipulation hover:no-underline no-underline! active:brightness-90 transition-all duration-300";

export const btnPrimary =
  `${btn} bg-accent text-white! border-accent hover:bg-accent-hover hover:border-accent-hover hover:scale-95`;

export const btnSecondary =
  `${btn} bg-transparent text-ink border-ink/40 hover:border-ink hover:bg-ink/8`;

export const btnSecondaryOnDark =
  `${btn} bg-transparent text-white! border-white hover:bg-white hover:text-sunken!`;

export const btnRow = "flex flex-wrap items-center gap-3";

/** Card geometry with no fill, for cards that set their own background. */
export const cardShell = "border border-line rounded-card p-5";

export const card = `${cardShell} bg-surface`;

export const cardHover =
  "transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export const cardLink =
  `${card} block text-inherit no-underline!`;

export const eyebrow =
  "mb-2 text-sm font-semibold tracking-[0.12em] text-accent uppercase";

export const muted = "text-ink-muted text-sm md:text-base";

export const h1 =
  "mb-3 text-[2rem] md:text-4xl font-bold leading-[1.05] text-balance md:text-[3.25rem]";

export const h2 =
  "mb-3 text-[1.5rem] md:text-[1.75rem] font-bold leading-[1.15] text-balance md:text-4xl";

export const h3 =
  "mb-1.5 text-base md:text-xl font-semibold leading-snug text-balance capitalize";

export const split =
  "grid gap-8 lg:grid-cols-2 lg:items-start";

export const grid3 =
  "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
