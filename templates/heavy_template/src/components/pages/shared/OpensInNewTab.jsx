import { CHROME } from "@/lib/chrome";

/** Spoken hint for links that leave the site in a new tab. */
export function OpensInNewTab() {
  return <span className="sr-only"> ({CHROME.opensNewTab})</span>;
}
