/**
 * Google Maps matches "Washington, DC" far better than the full territory name,
 * so short-code states keep their code while everything else uses the full name.
 */
const CODE_ONLY_STATES = new Set(["DC"]);

export function buildLocationQuery(city, state) {
  const cityName = String(city || "").trim();
  const code = String(state?.code || "").trim().toUpperCase();
  const stateLabel = CODE_ONLY_STATES.has(code)
    ? code
    : String(state?.name || "").trim();

  if (!cityName || !stateLabel) {
    throw new Error("Cannot build a location query without a city and state");
  }

  return `${cityName}, ${stateLabel}`;
}
