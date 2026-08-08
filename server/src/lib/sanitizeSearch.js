/**
 * Sanitize free-text search for PostgREST filters and JS matching.
 *
 * - Strips LIKE wildcards (% _) so users can't broaden matches
 * - Strips PostgREST .or() reserved chars (, ( ) ") so filter strings can't be injected
 * - Strips backslashes
 * - Keeps apostrophes (O'Brien), @ and . for emails/domains
 * - Caps length
 *
 * Note: Queries go through Supabase/PostgREST (parameterized SQL). This is not raw SQL
 * concatenation; the risk is PostgREST filter grammar injection in .or() strings.
 */
export function sanitizeIlikeSearch(q, { maxLength = 100 } = {}) {
  if (q == null) return null;
  const cleaned = String(q)
    .replace(/[%_,()\"\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return cleaned || null;
}

/**
 * Build a PostgREST .or() clause of col.ilike."%term%" filters.
 * Values are double-quoted so apostrophes/spaces are safe.
 */
export function buildIlikeOrFilter(columns, sanitized) {
  if (!sanitized || !columns?.length) return null;
  const pattern = `%${sanitized}%`.replace(/"/g, '\\"');
  return columns.map((col) => `${col}.ilike."${pattern}"`).join(",");
}
