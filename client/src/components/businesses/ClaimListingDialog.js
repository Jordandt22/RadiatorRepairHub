"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/contexts/ToastProvider";
import { claimBusiness } from "@/lib/api/businesses";
import {
  getEmailClaimBlockMessage,
  getEmailClaimBlockReason,
  getPhoneClaimBlockMessage,
} from "@/lib/claimListingEligibility";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { PHONE_CLAIM_CONSENT_TEXT } from "@/lib/claimConsent";
import ClaimConsentPolicyLinks from "@/components/businesses/ClaimConsentPolicyLinks";

function ClaimUnavailableNotice({ message }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {message ?? "This claim option isn't available for this listing right now."}
      </p>
      <Link
        href="/how-to-claim"
        className="inline-block text-sm text-interactive hover:underline"
        prefetch={false}
      >
        How claiming works
      </Link>
    </div>
  );
}

/**
 * Shared claim entry point for the listing page. Email is the default channel
 * because it is cheaper and simpler; the phone tab places a verification call.
 * Both tabs stay clickable so owners can always see why an option is unavailable.
 */
export default function ClaimListingDialog({
  open,
  onOpenChange,
  businessId,
  businessSlug,
  businessName,
  email = null,
  emailStatus = null,
  hasDuplicateEmail = false,
  phone = null,
  emailEligible = false,
  phoneEligible = false,
  phoneBlockReason = null,
  source = "listing",
}) {
  const router = useRouter();
  const { showCustomError } = useToast();
  const posthog = usePostHog();
  const { isSignedIn } = useIsSignedIn();
  const [channel, setChannel] = useState(emailEligible ? "email" : "phone");
  const [consented, setConsented] = useState(false);
  const [submittingChannel, setSubmittingChannel] = useState(null);

  useEffect(() => {
    if (!open) return;
    setChannel(emailEligible ? "email" : "phone");
    setConsented(false);
    setSubmittingChannel(null);
  }, [open, emailEligible]);

  const capture = (event, props = {}) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_slug: businessSlug || undefined,
      business_name: businessName || undefined,
      signed_in: Boolean(isSignedIn),
      source,
      ...props,
    });
  };

  const isSubmitting = submittingChannel !== null;
  const emailBlockMessage = getEmailClaimBlockMessage(
    getEmailClaimBlockReason({ email, emailStatus, hasDuplicateEmail })
  );
  const phoneBlockMessage = getPhoneClaimBlockMessage(phoneBlockReason);

  const start = async (nextChannel) => {
    // Debounce: one in-flight start at a time, no matter how fast they click.
    if (isSubmitting) return;
    if (nextChannel === "email" && !emailEligible) return;
    if (nextChannel === "phone" && (!phoneEligible || !consented)) return;

    setSubmittingChannel(nextChannel);
    capture("claim_started", { channel: nextChannel });

    try {
      const { data, error } = await claimBusiness(businessId, {
        channel: nextChannel,
        consentAcknowledged: nextChannel === "phone" ? consented : undefined,
      });

      if (error) {
        capture("claim_failed", {
          stage: "start",
          channel: nextChannel,
          error_code: typeof error.code === "string" ? error.code : undefined,
          error_message:
            typeof error.message === "string" ? error.message : undefined,
        });
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to start the claim process. Please try again."
        );
        setSubmittingChannel(null);
        return;
      }

      capture("claim_code_sent", { channel: nextChannel });

      if (data?.claimRequestId) {
        router.push(`/claim/verify/${data.claimRequestId}`);
        return;
      }

      showCustomError("Unable to start the claim process. Please try again.");
      setSubmittingChannel(null);
    } catch {
      capture("claim_failed", { stage: "start", channel: nextChannel });
      showCustomError("Unable to start the claim process. Please try again.");
      setSubmittingChannel(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Claim {businessName || "this listing"}</DialogTitle>
          <DialogDescription>
            Verify that you represent this business, then finish creating your
            free owner account.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={channel} onValueChange={setChannel}>
          <TabsList className="w-full">
            <TabsTrigger
              value="email"
              className="cursor-pointer px-6 transition-colors duration-200"
            >
              <Mail aria-hidden="true" />
              Email
            </TabsTrigger>
            <TabsTrigger
              value="phone"
              className="cursor-pointer px-6 transition-colors duration-200"
            >
              <Phone aria-hidden="true" />
              Phone call
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 pt-2">
            {emailEligible ? (
              <>
                <div className="grid gap-1.5">
                  <label
                    htmlFor="claim-dialog-email"
                    className="text-sm font-medium text-foreground"
                  >
                    We&apos;ll email the code to
                  </label>
                  <Input
                    id="claim-dialog-email"
                    type="email"
                    value={email ?? ""}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  We send a 6-character code to the email on this listing. Enter
                  it on the next page to finish claiming. The code expires in 1
                  hour.
                </p>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={() => start("email")}
                >
                  {submittingChannel === "email" ? "Sending..." : "Send code"}
                </Button>
              </>
            ) : (
              <ClaimUnavailableNotice message={emailBlockMessage} />
            )}
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 pt-2">
            <div className="grid gap-1.5">
              <label
                htmlFor="claim-dialog-phone"
                className="text-sm font-medium text-foreground"
              >
                We&apos;ll call
              </label>
              <Input
                id="claim-dialog-phone"
                type="tel"
                value={phone ?? ""}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              An automated call reads a 6-digit code out loud. You&apos;ll be
              asked to press a key first, then enter the code on the next page.
            </p>
            <ul className="list-disc space-y-1.5 rounded-md bg-muted/40 p-3 pl-7 text-xs text-muted-foreground">
              <li>
                The call will never ask for personal, payment, or account
                information.
              </li>
              <li>
                Automated phone menus and voicemail can cut the call short. If
                that happens, answer directly or claim by email instead.
              </li>
              <li>
                Some carriers label automated calls as spam, so the call may show
                up as unknown or blocked.
              </li>
            </ul>

            {!phoneEligible ? (
              <div className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-3">
                <p className="text-sm text-muted-foreground">
                  {phoneBlockMessage ??
                    "Phone verification isn't available for this listing right now."}
                </p>
                <Link
                  href="/how-to-claim"
                  className="inline-block text-sm text-interactive hover:underline"
                  prefetch={false}
                >
                  How claiming works
                </Link>
              </div>
            ) : null}

            <div
              className={`space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 ${
                phoneEligible ? "" : "opacity-60"
              }`}
            >
              <label
                className={`flex items-start gap-3 text-sm text-foreground ${
                  phoneEligible ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  checked={consented}
                  onChange={(event) => setConsented(event.target.checked)}
                  disabled={isSubmitting || !phoneEligible}
                />
                <span className="text-xs leading-relaxed">
                  {PHONE_CLAIM_CONSENT_TEXT}
                </span>
              </label>
              <ClaimConsentPolicyLinks />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={isSubmitting || !phoneEligible || !consented}
              onClick={() => start("phone")}
            >
              {submittingChannel === "phone" ? "Calling..." : "Call me"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
