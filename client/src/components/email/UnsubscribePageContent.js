"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { fetchApi } from "@/lib/api/fetchApi";

export default function UnsubscribePageContent() {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState(token ? "loading" : "missing");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let mounted = true;
    fetchApi(`/email/unsubscribe?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    }).then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data) {
        setState("error");
        posthog?.capture("weekly_digest_unsubscribe_failed", {
          has_token: true,
        });
        return;
      }
      setResult(data);
      setState("success");
      posthog?.capture("weekly_digest_unsubscribed", {
        business_id: data.businessId || undefined,
        business_slug: data.businessSlug || undefined,
        business_name: data.businessName || undefined,
        is_claimed: Boolean(data.isClaimed),
      });
    });
    return () => {
      mounted = false;
    };
  }, [token, posthog]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Weekly report unsubscribe
      </h1>

      {state === "loading" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Updating your email preferences…
        </p>
      ) : null}

      {state === "missing" || state === "error" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          This unsubscribe link is invalid or expired. If you still receive
          weekly reports, use the latest unsubscribe link in a recent email.
        </p>
      ) : null}

      {state === "success" ? (
        <div className="mt-4 space-y-4 text-sm text-muted-foreground">
          <p>
            You won’t receive weekly activity reports for{" "}
            <strong className="text-foreground">
              {result?.businessName || "this listing"}
            </strong>
            {result?.email ? ` at ${result.email}` : ""}.
          </p>
          {!result?.isClaimed ? (
            <p>
              Want to manage your listing instead?{" "}
              <Link
                href={
                  result?.businessSlug
                    ? `/business/${result.businessSlug}`
                    : "/how-to-claim"
                }
                className="text-primary underline"
              >
                Claim it free
              </Link>
              .
            </p>
          ) : (
            <p>
              You can turn weekly reports back on later in{" "}
              <Link href="/settings?tab=notifications" className="text-primary underline">
                notification settings
              </Link>
              .
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
