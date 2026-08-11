"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CLAIM_ELIGIBILITY_LABELS } from "@/components/pages/outreach/outreachConstants";

const SKIP_REASON_LABELS = {
  not_found: "Not found",
  already_sent: "Already sent",
  has_website: "Has website",
  missing_recipient: "Missing recipient",
  invalid_outreach_type: "Invalid type",
  claim_invite_not_sent: "No claim invite sent",
  claim_invite_too_recent: "Claim invite sent less than 7 days ago",
  eligibility_able: "Eligibility: Able",
  eligibility_no_email: "No email",
  eligibility_duplicate_email: "Duplicate email",
  eligibility_claimed: "Claimed",
  eligibility_unknown: "Unknown eligibility",
};

function skipLabel(reason) {
  if (!reason) return "Skipped";
  if (SKIP_REASON_LABELS[reason]) return SKIP_REASON_LABELS[reason];
  if (reason.startsWith("eligibility_")) {
    const key = reason.replace("eligibility_", "");
    return `Eligibility: ${CLAIM_ELIGIBILITY_LABELS[key] ?? key}`;
  }
  return reason;
}

export default function OutreachPreviewSheet({
  open,
  onOpenChange,
  preview,
  outreachTypeLabel,
  sendPending = false,
  onConfirmSend,
}) {
  const willSend = preview?.will_send ?? [];
  const skipped = preview?.skipped ?? [];
  const sample = preview?.sample ?? null;
  const canSend = willSend.length > 0 && !sendPending;
  const devRedirect = Boolean(preview?.dev_redirect);
  const deliveryEmail = preview?.delivery_email ?? sample?.delivery_to ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>Preview outreach email</SheetTitle>
          <SheetDescription>
            {outreachTypeLabel
              ? `${outreachTypeLabel} · ${willSend.length} will send`
              : `${willSend.length} will send`}
            {skipped.length > 0 ? ` · ${skipped.length} skipped` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
          {devRedirect && deliveryEmail ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Development mode: all emails will be delivered to{" "}
              <span className="font-medium">{deliveryEmail}</span>, not
              business addresses.
            </p>
          ) : null}

          {sample ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Sample for {sample.business_title ?? "business"} →{" "}
                {devRedirect && sample.delivery_to
                  ? `${sample.recipient} (delivered to ${sample.delivery_to})`
                  : sample.recipient}
              </p>
              <p className="text-sm font-medium">
                {devRedirect ? `[DEV] ${sample.subject}` : sample.subject}
              </p>
              <div
                className="prose prose-sm max-w-none rounded-md border border-border bg-background p-3 text-foreground"
                dangerouslySetInnerHTML={{ __html: sample.html }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No eligible recipients in this selection.
            </p>
          )}

          {willSend.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recipients ({willSend.length})
              </p>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
                {willSend.map((row) => (
                  <li key={row.id} className="truncate">
                    <span className="font-medium">{row.title ?? "—"}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {row.recipient}
                      {devRedirect && row.delivery_to
                        ? ` → ${row.delivery_to}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {skipped.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Skipped ({skipped.length})
              </p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                {skipped.map((row) => (
                  <li key={row.id} className="truncate">
                    {row.title ?? row.id} — {skipLabel(row.reason)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            disabled={sendPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={!canSend} onClick={onConfirmSend}>
            {sendPending
              ? "Sending…"
              : `Send ${willSend.length || ""} email${willSend.length === 1 ? "" : "s"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
