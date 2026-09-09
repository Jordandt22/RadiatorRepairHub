"use client";

import { useEffect, useState } from "react";
import {
  BanIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  MessageSquareTextIcon,
  SkipForwardIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import ClaimEligibilityBadge from "@/components/pages/outreach/ClaimEligibilityBadge";
import { OUTREACH_SMS_BODY_MAX } from "@/components/pages/outreach/outreachConstants";

const GOOGLE_VOICE_URL = "https://voice.google.com/u/1/messages";

const SKIP_REASON_LABELS = {
  eligibility_email_able: "Email able only — no usable phone",
  eligibility_email_review: "Email under review",
  eligibility_phone_review: "Phone under review",
  eligibility_duplicate_email: "Duplicate email",
  eligibility_duplicate_phone: "Phone shared with another listing",
  eligibility_no_contact: "No contact info",
  eligibility_claimed: "Already claimed",
  missing_recipient: "No phone number",
  already_sent: "Already texted for this campaign",
  claim_invite_not_sent: "No SMS invite sent yet",
  claim_invite_too_recent: "SMS invite sent less than 7 days ago",
  declined: "Shop declined SMS outreach",
  invalid_outreach_type: "Invalid campaign type",
};

function CopyButton({ label, value, disabled }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || !value}
      onClick={handleCopy}
      className="cursor-pointer rounded-full"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : label}
    </Button>
  );
}

function ComposerSkeleton() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-9 w-1/2" />
    </div>
  );
}

export default function OutreachSmsComposer({
  business = null,
  preview = null,
  isLoading = false,
  previewError = null,
  body = "",
  onBodyChange,
  onMarkSent,
  markSentPending = false,
  markSentDisabled = true,
  onMarkDeclined,
  markDeclinedPending = false,
  markDeclinedDisabled = true,
  onSkip,
  actionError = null,
}) {
  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
          <MessageSquareTextIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex max-w-sm flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Select a business
          </p>
          <p className="text-sm text-muted-foreground">
            Pick a listing from the queue to copy its phone number and message.
          </p>
        </div>
      </div>
    );
  }

  const phone = preview?.phone ?? business.phone ?? null;
  const skipReason = preview?.skip_reason ?? null;
  const skipLabel = skipReason
    ? (SKIP_REASON_LABELS[skipReason] ?? skipReason)
    : null;
  const remaining = OUTREACH_SMS_BODY_MAX - body.length;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <BusinessTitleLink
          id={business.id}
          title={business.title}
          slug={business.slug}
        />
        <div className="flex flex-wrap items-center gap-2">
          <ClaimEligibilityBadge
            eligibility={preview?.claim_eligibility ?? business.claim_eligibility}
          />
          <span className="text-xs text-muted-foreground">
            {[
              preview?.city_name ?? business.city_name,
              preview?.state_code ?? business.state_code,
            ]
              .filter(Boolean)
              .join(", ") || "Unknown location"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <ComposerSkeleton />
      ) : (
        <>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium tabular-nums">
                {phone ?? "—"}
              </span>
              <CopyButton label="Copy phone" value={phone} />
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={GOOGLE_VOICE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="cursor-pointer rounded-full"
              >
                <ExternalLinkIcon />
                Google Voice
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="rrh-outreach-sms-body">Message</Label>
              <span
                className={
                  remaining < 0
                    ? "text-xs text-destructive tabular-nums"
                    : "text-xs text-muted-foreground tabular-nums"
                }
              >
                {body.length}/{OUTREACH_SMS_BODY_MAX}
              </span>
            </div>
            <Textarea
              id="rrh-outreach-sms-body"
              name="rrh-outreach-sms-body"
              value={body}
              onChange={(event) => onBodyChange?.(event.target.value)}
              rows={6}
              className="min-h-32"
              placeholder="Message to paste into Google Voice"
            />
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton label="Copy message" value={body} />
            </div>
          </div>

          {skipLabel ? (
            <p className="text-sm text-amber-700">
              Not eligible to record: {skipLabel}
            </p>
          ) : null}
          {previewError ? (
            <p className="text-sm text-destructive">{previewError}</p>
          ) : null}
          {actionError ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={markSentDisabled || markSentPending}
              onClick={onMarkSent}
              className="cursor-pointer rounded-full"
            >
              <CheckIcon />
              Mark sent
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={markDeclinedDisabled || markDeclinedPending}
              onClick={onMarkDeclined}
              className="cursor-pointer rounded-full"
            >
              <BanIcon />
              Mark declined
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSkip}
              disabled={markSentPending || markDeclinedPending}
              className="cursor-pointer rounded-full"
            >
              <SkipForwardIcon />
              Skip
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
