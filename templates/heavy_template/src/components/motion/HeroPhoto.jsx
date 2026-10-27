/** CSS entrance — starts translated on first paint (no hydration jump). Opacity stays 1 for LCP. */
export function HeroPhoto({ className, children }) {
  return <div className={`hero-photo-enter ${className ?? ""}`.trim()}>{children}</div>;
}
