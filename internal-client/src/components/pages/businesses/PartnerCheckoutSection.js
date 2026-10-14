"use client";

import { useState } from "react";
import { CopyIcon, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/api/fetchApi";

const BLOCKING_STATUSES = ["active", "trialing", "past_due", "incomplete"];

function hasLiveSubscription(subscriptions) {
  return (Array.isArray(subscriptions) ? subscriptions : []).some((row) =>
    BLOCKING_STATUSES.includes(row?.status)
  );
}

export default function PartnerCheckoutSection({
  businessId,
  isClaimed = false,
  subscriptions = [],
  accessToken,
  logout,
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const blocked = isClaimed || hasLiveSubscription(subscriptions);

  const generateLink = async () => {
    if (!businessId || pending || blocked) return;
    setPending(true);
    setError(null);
    setCopied(false);
    const result = await fetchApi(
      `/admin/businesses/${businessId}/partner-checkout`,
      { method: "POST", accessToken }
    );
    setPending(false);
    if (result.status === 401) {
      logout?.();
      return;
    }
    if (result.error || !result.data?.url) {
      setCheckoutUrl("");
      setError(result.error?.message || "Unable to create a checkout link.");
      return;
    }
    setCheckoutUrl(result.data.url);
  };

  const copyLink = async () => {
    if (!checkoutUrl) return;
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
    } catch {
      setError("Unable to copy the link. Select it and copy it manually.");
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight">Partner checkout</h2>
      <p className="text-sm text-muted-foreground">
        Creates a 30-minute Stripe checkout link for the $300 Partner plan.
        Email and phone are collected on the Stripe page.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="cursor-pointer rounded-full"
          disabled={blocked || pending}
          onClick={generateLink}
        >
          <LinkIcon />
          {pending ? "Creating link…" : "Create checkout link"}
        </Button>
        {isClaimed ? (
          <span className="text-sm text-muted-foreground">
            This listing is already claimed.
          </span>
        ) : null}
        {!isClaimed && hasLiveSubscription(subscriptions) ? (
          <span className="text-sm text-muted-foreground">
            This listing already has a subscription.
          </span>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {checkoutUrl ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={checkoutUrl} aria-label="Partner checkout link" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={copyLink}
          >
            <CopyIcon />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
