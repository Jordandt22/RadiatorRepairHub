import { CHROME } from "@/lib/chrome";
import { OpensInNewTab } from "@/components/pages/shared/OpensInNewTab";
import { btnSecondary } from "@/lib/ui";

export function RrhLink({ url }) {
    if (!url)
        return null;
    return (
      <a
        className={btnSecondary}
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {CHROME.rrh}
        <OpensInNewTab />
      </a>
    );
}
