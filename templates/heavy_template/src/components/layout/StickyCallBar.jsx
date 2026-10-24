import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";

/** Phone within thumb reach on mobile. Hidden from md up, where the nav Call shows. */
export function StickyCallBar() {
  const { shop } = getConfig();
  if (!shop.phone?.trim()) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <a
        className="flex h-14 items-center justify-center bg-accent text-base font-semibold tracking-wide text-white no-underline"
        href={telHref(shop)}
      >
        {callLabel(shop)}
      </a>
    </div>
  );
}
