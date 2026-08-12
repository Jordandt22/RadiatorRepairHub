function normalizeStateText(value) {
  return String(value || "")
    .replace(/\./g, "")
    .trim()
    .toLowerCase();
}

/** Matches a pasted state fragment against the states loaded from the database. */
export function matchScrapeState(stateText, states = []) {
  const normalized = normalizeStateText(stateText);
  if (!normalized) return null;

  return (
    states.find((state) => normalizeStateText(state.code) === normalized) ??
    states.find((state) => normalizeStateText(state.name) === normalized) ??
    null
  );
}

function dedupeKey(city, stateText) {
  return `${city.trim().toLowerCase()}|${normalizeStateText(stateText)}`;
}

/**
 * Parses pasted "City, State" lines. Splitting on the last comma keeps
 * multi-word cities intact while still isolating the state fragment.
 */
export function parseScrapeCities(text, states = []) {
  const seen = new Set();
  const rows = [];
  let duplicates = 0;

  for (const rawLine of String(text || "").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const commaIndex = line.lastIndexOf(",");
    const city = commaIndex === -1 ? line : line.slice(0, commaIndex).trim();
    const stateText = commaIndex === -1 ? "" : line.slice(commaIndex + 1).trim();

    const key = dedupeKey(city, stateText);
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);

    rows.push({
      key: `${key}-${rows.length}`,
      city,
      state: matchScrapeState(stateText, states),
    });
  }

  return { rows, duplicates };
}

export function isScrapeCityRowValid(row) {
  return Boolean(row.city.trim() && row.state?.id);
}
