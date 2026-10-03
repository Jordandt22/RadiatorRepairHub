"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { hydrateSessionFromRedirect } from "@/lib/auth/redirectSession";

export default function EmailConfirmedContent() {
  const searchParams = useSearchParams();
  const isSignupConfirm = searchParams.get("flow") === "signup";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    hydrateSessionFromRedirect().finally(() => {
      if (mounted) setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const continueHref = isSignupConfirm ? "/signin" : "/settings";
  const continueLabel = isSignupConfirm ? "Sign in" : "Go to Settings";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700"
        aria-hidden="true"
      >
        <Check className="size-8 stroke-[2.5]" />
      </div>

      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Email Confirmed
      </h1>

      <p className="mt-3 text-base text-muted-foreground">
        Thanks, we received your confirmation.
      </p>

      {isSignupConfirm ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Your account email is confirmed. Sign in with the password you
          created to manage your listing.
        </p>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          For an email address update to finish, make sure you confirm from{" "}
          <span className="font-medium text-foreground">both</span> your old and
          new email inboxes. If you still have a confirmation link waiting, open
          it to complete the change.
        </p>
      )}

      <Link
        href={continueHref}
        className={`mt-8 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 ${
          ready ? "" : "pointer-events-none opacity-70"
        }`}
        aria-disabled={!ready}
      >
        {continueLabel}
      </Link>
    </div>
  );
}
