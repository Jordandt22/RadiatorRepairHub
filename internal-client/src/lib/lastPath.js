const LAST_PATH_KEY = "admin_last_path";

function isSafeInternalPath(path) {
  if (typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path === "/") return false;
  // Login lives at /
  if (path.startsWith("/?")) return false;
  return true;
}

export function saveLastPath(pathWithSearch) {
  if (typeof window === "undefined") return;
  if (!isSafeInternalPath(pathWithSearch)) return;
  try {
    localStorage.setItem(LAST_PATH_KEY, pathWithSearch);
  } catch {
    // ignore quota / private mode
  }
}

export function saveCurrentPath() {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}`;
  saveLastPath(path);
}

export function consumeLastPath() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LAST_PATH_KEY);
    localStorage.removeItem(LAST_PATH_KEY);
    return isSafeInternalPath(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function peekLastPath() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LAST_PATH_KEY);
    return isSafeInternalPath(stored) ? stored : null;
  } catch {
    return null;
  }
}
