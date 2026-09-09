import { formatDate } from "@/components/pages/dashboard/formatDate";
import ClaimEligibilityBadge from "@/components/pages/outreach/ClaimEligibilityBadge";
import OutreachEmptyState from "@/components/pages/outreach/OutreachEmptyState";
import { cn } from "@/lib/utils";

function locationLabel(row) {
  return [row.city_name, row.state_code].filter(Boolean).join(", ") || "—";
}

function sentLabel(row) {
  if (row.sms_declined_at) {
    return `Declined ${formatDate(row.sms_declined_at)}`;
  }
  if (row.sms_claim_followup_sent_at) {
    return `Follow-up ${formatDate(row.sms_claim_followup_sent_at)}`;
  }
  if (row.sms_claim_invite_sent_at) {
    return `Invite ${formatDate(row.sms_claim_invite_sent_at)}`;
  }
  return "Not texted";
}

export default function OutreachSmsQueueTable({
  businesses = [],
  selectedId = null,
  onSelect,
  hasFilters = false,
}) {
  if (!businesses.length) {
    return <OutreachEmptyState hasFilters={hasFilters} variant="sms" />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {businesses.map((row) => {
        const active = row.id === selectedId;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect?.(row)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "w-full cursor-pointer rounded-lg border border-border bg-card p-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                active && "border-foreground/30 bg-muted",
              )}
            >
              <span className="block truncate text-sm font-medium">
                {row.title ?? "—"}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {locationLabel(row)} · {row.phone ?? "No phone"}
              </span>
              <span className="mt-2 flex flex-wrap items-center gap-2">
                <ClaimEligibilityBadge eligibility={row.claim_eligibility} />
                <span className="text-xs text-muted-foreground">
                  {sentLabel(row)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
