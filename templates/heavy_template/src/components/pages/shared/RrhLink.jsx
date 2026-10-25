import { ArrowRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { OpensInNewTab } from "@/components/pages/shared/OpensInNewTab";
import { btnSecondary } from "@/lib/ui";

export function RrhLink({ url }) {
  if (!url)
    return null;
  return (
    <a
      className={`${btnSecondary} text-sm! gap-2`}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {CHROME.rrh}
      <ArrowRight size={18} strokeWidth={2} aria-hidden />
      <OpensInNewTab />
    </a>
  );
}
