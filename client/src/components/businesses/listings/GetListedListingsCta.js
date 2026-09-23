import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GetListedListingsCta() {
  return (
    <aside
      className="mt-10 rounded-lg border border-border bg-muted/40 px-5 py-6 sm:px-6"
      aria-label="Get your business listed"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-base font-semibold text-foreground sm:text-lg">
              Don&apos;t see your shop?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Request a free listing on RadiatorRepairHub so drivers can find you.
            </p>
          </div>
        </div>
        <Link
          href="/get-listed"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full shrink-0 justify-center rounded-full sm:w-auto"
          )}
        >
          Get Listed
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
