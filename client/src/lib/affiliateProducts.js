/**
 * Readable aliases for affiliate product UUIDs in blog frontmatter.
 * Deactivating a product in admin still hides it (API filters is_active).
 * New products can use a raw UUID in frontmatter until an alias is added.
 */
export const AFFILIATE_PRODUCT_ALIASES = {
  valvoline: "89657c5b-7906-4ba7-a4b1-ef86e670ba2b",
  "prestone-asian": "1bdacdb8-c8a0-41f2-a8e7-fb40be2e7855",
  "prestone-dexcool": "bd463b98-c75f-4663-a13b-dc7c29af49b0",
  "zerex-g05": "b8564dfd-4562-415b-83ba-bab5ee1217ec",
  "radiator-flush": "b571b7ab-6888-4f99-8aae-da2eb2b59ea0",
  "radiator-cap": "9e60e8e3-d97d-4901-ba89-d2057980e569",
  "radiator-cap-13": "24f6ce56-b6ce-47b8-977a-da903d74f42e",
  "ir-thermometer": "9bab2d35-4e14-453d-9a59-5504a01296e0",
  "coolant-funnel": "802b381b-bbfd-4232-886e-86aff0bf1418",
  "coolant-funnel-lisle": "75f7b2e6-1373-494f-80d8-cd85a21febc6",
  "combustion-leak-detector": "df2388f0-ed62-4c2e-8c13-303e684e7d15",
  "coolant-pressure-tester": "6f637396-c8ff-4d48-981b-81ff2baca399",
};

export const FEATURED_AFFILIATE_PRODUCT_ALIASES = [
  "valvoline",
  "prestone-dexcool",
  "radiator-flush",
  "radiator-cap",
  "radiator-cap-13",
  "coolant-funnel",
  "ir-thermometer",
  "combustion-leak-detector",
  "coolant-pressure-tester",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveAffiliateProductIds(refs = []) {
  if (!Array.isArray(refs)) return [];

  const seen = new Set();
  const ids = [];

  for (const ref of refs) {
    if (typeof ref !== "string") continue;
    const key = ref.trim();
    if (!key) continue;

    const id = AFFILIATE_PRODUCT_ALIASES[key] ?? (UUID_REGEX.test(key) ? key : null);
    if (!id || seen.has(id)) continue;

    seen.add(id);
    ids.push(id);
  }

  return ids;
}

/**
 * Split MDX body after the first ## section (before the second ##).
 * Recommended products render between the two halves.
 */
export function splitContentAfterFirstSection(content) {
  if (!content) return { before: "", after: "" };

  const lines = content.split("\n");
  let h2Count = 0;
  let splitAt = null;

  for (let i = 0; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      h2Count += 1;
      if (h2Count === 2) {
        splitAt = i;
        break;
      }
    }
  }

  if (splitAt == null) {
    return { before: content, after: "" };
  }

  return {
    before: lines.slice(0, splitAt).join("\n").trimEnd(),
    after: lines.slice(splitAt).join("\n").trimStart(),
  };
}
