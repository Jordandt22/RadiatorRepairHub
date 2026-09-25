import { ArrowRight, LoaderCircle } from "lucide-react";

/**
 * Shared label + trailing icon for Featured upgrade buttons.
 */
export default function FeaturedUpgradeCtaLabel({
  isSubmitting = false,
  isLoading = false,
  readyLabel = "Upgrade to Featured",
  submittingLabel = "Redirecting…",
  loadingLabel = "Loading…",
}) {
  if (isSubmitting) {
    return (
      <>
        <LoaderCircle
          className="size-4 shrink-0 animate-spin"
          aria-hidden="true"
        />
        {submittingLabel}
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <LoaderCircle
          className="size-4 shrink-0 animate-spin"
          aria-hidden="true"
        />
        {loadingLabel}
      </>
    );
  }

  return (
    <>
      {readyLabel}
      <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
    </>
  );
}
