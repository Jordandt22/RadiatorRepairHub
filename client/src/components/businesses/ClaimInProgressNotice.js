"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { cn } from "@/lib/utils";

export function formatClaimExpiry(expiresAt) {
  if (!expiresAt) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(expiresAt));
  } catch {
    return null;
  }
}

/**
 * Shown instead of the claim button while another claim is pending. There is no
 * deep link back into the verification page on purpose: only the person who
 * started the claim should be able to enter the code.
 */
export default function ClaimInProgressNotice({
  expiresAt = null,
  businessId = null,
  businessSlug = null,
  businessName = null,
  channel = null,
  className = "",
}) {
  const posthog = usePostHog();
  const { isSignedIn } = useIsSignedIn();
  const [helpOpen, setHelpOpen] = useState(false);
  const expiry = formatClaimExpiry(expiresAt);

  const capture = (event, props = {}) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_slug: businessSlug || undefined,
      business_name: businessName || undefined,
      channel: channel || undefined,
      signed_in: Boolean(isSignedIn),
      source: "claim_in_progress",
      ...props,
    });
  };

  const openHelp = () => {
    capture("claim_lost_verify_help_opened");
    setHelpOpen(true);
  };

  return (
    <>
      <div className={className}>
        <div className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-muted px-4 py-2.5 text-muted-foreground">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">Claim in progress</p>
        </div>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          {expiry
            ? `Expires ${expiry}`
            : "This claim expires within the hour."}
        </p>
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs text-interactive"
            onClick={openHelp}
          >
            Don&apos;t have the verification page?
          </Button>
        </div>
      </div>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lost your verification page?</DialogTitle>
            <DialogDescription>
              A claim for this listing is already underway, so a new one can&apos;t
              be started yet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-3 py-3">
              <h3 className="font-medium text-foreground">Email verification</h3>
              <p>
                Check your browser history for a RadiatorRepairHub claim link, or
                open the verification link in the claim email we sent (and check
                spam if you don&apos;t see it). You can also wait for the claim to
                expire (within one hour of the last attempt) and start again.
              </p>
            </div>
            <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-3 py-3">
              <h3 className="font-medium text-foreground">Phone verification</h3>
              <p>
                Check your browser history for a RadiatorRepairHub claim link, or
                wait for the claim to expire (within one hour of the last attempt)
                and start again. Keep the verification page open next time. Phone
                claims don&apos;t include an email link.
              </p>
            </div>
            <p>
              If someone else started this claim, or you need it released sooner,{" "}
              <Link
                href="/contact"
                className="text-interactive underline underline-offset-2"
                onClick={() =>
                  capture("claim_lost_verify_help_contact_clicked", {
                    placement: "body_link",
                  })
                }
              >
                contact support
              </Link>.
              We&apos;ll be happy to help you get your claim started again.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto px-8"
              )}
              prefetch={false}
              onClick={() =>
                capture("claim_lost_verify_help_contact_clicked", {
                  placement: "footer_button",
                })
              }
            >
              Contact Support
            </Link>
            <DialogClose
              render={<Button type="button" className="w-full sm:w-auto px-8" />}
            >
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
