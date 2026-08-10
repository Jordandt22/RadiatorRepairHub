import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const SCHEDULE_LIMITS = [10, 25, 50, 75];

const CAMPAIGN_LABELS = {
  claim_invite: "Claim Invite",
  ownership_claim_invite: "Ownership Claim Invite",
  lead_claim_invite: "Lead Claim Invite",
};

export default function OutreachScheduleCampaignRow({
  campaign,
  disabled,
  onChange,
}) {
  const sliderIndex = Math.max(
    0,
    SCHEDULE_LIMITS.indexOf(campaign.limit_count),
  );

  return (
    <div className="grid gap-4 rounded-lg border border-border/70 p-4 md:grid-cols-[minmax(13rem,1fr)_minmax(16rem,1.4fr)] md:items-center">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`schedule-${campaign.outreach_type}`}
          checked={campaign.enabled}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange({ ...campaign, enabled: checked === true })
          }
        />
        <div className="grid gap-0.5">
          <Label htmlFor={`schedule-${campaign.outreach_type}`}>
            {CAMPAIGN_LABELS[campaign.outreach_type] ??
              campaign.outreach_type}
          </Label>
          <span className="font-mono text-[0.6875rem] text-muted-foreground">
            {campaign.outreach_type}
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`limit-${campaign.outreach_type}`}>
            Daily batch limit
          </Label>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            {campaign.limit_count}
          </span>
        </div>
        <input
          id={`limit-${campaign.outreach_type}`}
          type="range"
          min="0"
          max={String(SCHEDULE_LIMITS.length - 1)}
          step="1"
          value={sliderIndex}
          disabled={disabled || !campaign.enabled}
          aria-valuetext={String(campaign.limit_count)}
          onChange={(event) =>
            onChange({
              ...campaign,
              limit_count: SCHEDULE_LIMITS[Number(event.target.value)],
            })
          }
          className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div
          aria-hidden="true"
          className="flex justify-between text-[0.625rem] text-muted-foreground"
        >
          {SCHEDULE_LIMITS.map((limit) => (
            <span key={limit}>{limit}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
