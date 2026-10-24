import { CHROME } from "@/lib/chrome";
import { getConfig, serviceAreas } from "@/lib/config";
import { muted } from "@/lib/ui";

/** Towns the shop covers, as chips. Hidden unless the client fills the array. */
export function ServiceAreas({ className = "" }) {
  const areas = serviceAreas(getConfig());
  if (!areas.length) return null;

  return (
    <div className={className}>
      <p className={`mb-2 text-sm font-semibold ${muted}`}>{CHROME.serviceAreas}</p>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {areas.map((area) => (
          <li
            className="rounded-card border border-line bg-surface px-3 py-1 text-sm font-medium"
            key={area}
          >
            {area}
          </li>
        ))}
      </ul>
    </div>
  );
}
