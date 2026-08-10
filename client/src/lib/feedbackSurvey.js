export const FEEDBACK_SURVEY_STORAGE_KEY = "rrh_feedback_survey";

export const SUBMIT_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
export const SKIP_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * @returns {{ at: string, action: "submit" | "skip" } | null}
 */
function readSurveyRecord() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(FEEDBACK_SURVEY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.at !== "string" ||
      (parsed.action !== "submit" && parsed.action !== "skip")
    ) {
      return null;
    }

    const atMs = Date.parse(parsed.at);
    if (Number.isNaN(atMs)) return null;

    return { at: parsed.at, action: parsed.action };
  } catch {
    return null;
  }
}

export function shouldShowPostSubmitSurvey() {
  const record = readSurveyRecord();
  if (!record) return true;

  const atMs = Date.parse(record.at);
  const cooldownMs =
    record.action === "submit" ? SUBMIT_COOLDOWN_MS : SKIP_COOLDOWN_MS;

  return Date.now() - atMs >= cooldownMs;
}

/**
 * @param {"submit" | "skip"} action
 */
export function markPostSubmitSurveySeen(action) {
  if (typeof window === "undefined") return;
  if (action !== "submit" && action !== "skip") return;

  try {
    window.localStorage.setItem(
      FEEDBACK_SURVEY_STORAGE_KEY,
      JSON.stringify({
        at: new Date().toISOString(),
        action,
      })
    );
  } catch {
    // Fail open — ignore storage errors.
  }
}
