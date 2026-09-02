"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/contexts/ToastProvider";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import {
  fetchOwnedBusinessNotifications,
  updateOwnedBusinessNotifications,
} from "@/lib/api/businessNotifications";

function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    value
  );
}

function sourceLabel(source) {
  if (source === "notification_email") return "notification email";
  if (source === "account_email") return "account email";
  if (source === "listing_email") return "listing contact email";
  return "available email";
}

function BusinessNotificationCard({
  business,
  accountEmail,
  onSaved,
}) {
  const posthog = usePostHog();
  const { showCustomSuccess, showCustomError } = useToast();
  const [settings, setSettings] = useState(null);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchOwnedBusinessNotifications(business.id).then(({ data, error: fetchError }) => {
      if (!mounted) return;
      if (fetchError || !data) {
        setError("Unable to load notification settings.");
        setLoading(false);
        return;
      }
      setSettings(data);
      setNotificationEmail(data.notificationEmail || "");
      setWeeklyDigestEnabled(data.weeklyDigestEnabled !== false);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [business.id]);

  const hasChanges = useMemo(() => {
    if (!settings) return false;
    const current = (notificationEmail || "").trim().toLowerCase();
    const saved = (settings.notificationEmail || "").trim().toLowerCase();
    return (
      current !== saved || weeklyDigestEnabled !== settings.weeklyDigestEnabled
    );
  }, [notificationEmail, settings, weeklyDigestEnabled]);

  const handleSave = async (event) => {
    event.preventDefault();
    const trimmed = notificationEmail.trim();
    if (trimmed && !isValidEmail(trimmed)) {
      setError("Enter a valid notification email or leave it blank.");
      return;
    }
    const previousEnabled = settings?.weeklyDigestEnabled !== false;
    const previousEmail = (settings?.notificationEmail || "").trim().toLowerCase();
    setSaving(true);
    setError("");
    const { data, error: saveError } = await updateOwnedBusinessNotifications(
      business.id,
      {
        notificationEmail: trimmed || null,
        weeklyDigestEnabled,
      }
    );
    setSaving(false);
    if (saveError || !data) {
      const message =
        saveError?.message || "Unable to save notification settings.";
      setError(typeof message === "string" ? message : "Unable to save.");
      showCustomError("Unable to save notification settings.");
      return;
    }
    setSettings(data);
    setNotificationEmail(data.notificationEmail || "");
    setWeeklyDigestEnabled(data.weeklyDigestEnabled !== false);
    showCustomSuccess("Notification settings saved.");

    const enabledNow = data.weeklyDigestEnabled !== false;
    if (previousEnabled !== enabledNow) {
      posthog?.capture(
        enabledNow
          ? "weekly_digest_enabled"
          : "weekly_digest_disabled",
        {
          business_id: business.id,
          business_slug: business.slug || undefined,
          business_name: business.title || undefined,
          source: "settings_notifications",
        }
      );
    }
    if (previousEmail !== (data.notificationEmail || "").trim().toLowerCase()) {
      posthog?.capture("notification_email_updated", {
        business_id: business.id,
        business_slug: business.slug || undefined,
        business_name: business.title || undefined,
        has_notification_email: Boolean(data.notificationEmail),
        source: "settings_notifications",
      });
    }
    onSaved?.(data);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-10 w-full" />
        <Skeleton className="mt-3 h-6 w-64" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4 rounded-lg border border-border bg-card p-4"
    >
      <div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          {business.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Listing contact: {settings?.listingEmail || "None on file"}
          {business.slug ? (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/business/${business.slug}`}
                className="text-primary underline"
              >
                Edit listing
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`notification-email-${business.id}`}
          className="text-sm font-medium text-foreground"
        >
          Notification email
        </label>
        <Input
          id={`notification-email-${business.id}`}
          type="email"
          value={notificationEmail}
          onChange={(event) => setNotificationEmail(event.target.value)}
          placeholder={accountEmail || "you@example.com"}
        />
        <p className="text-xs text-muted-foreground">
          Optional. Leave blank to use your account email
          {accountEmail ? ` (${accountEmail})` : ""}.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-primary"
          checked={weeklyDigestEnabled}
          onChange={(event) => setWeeklyDigestEnabled(event.target.checked)}
        />
        <span>
          Weekly activity report
          <span className="mt-0.5 block text-xs text-muted-foreground">
            A weekly email with last week’s listing stats.
          </span>
        </span>
      </label>

      {!(business.is_featured || settings?.isFeatured) ? (
        <div
          role="region"
          aria-label="Featured listing upgrade"
          className="flex flex-col gap-3 rounded-lg border border-amber-400/50 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/25 dark:bg-amber-500/10"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Star className="size-5 fill-current" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading font-semibold text-foreground">
                Unlock more in your weekly report
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Basic reports include page views and impressions. Featured adds
                phone clicks, click-through rate, average position, and competitor
                insights.
              </p>
            </div>
          </div>
          <Link
            href={`/pricing?business=${encodeURIComponent(business.id)}`}
            className={buttonVariants({
              className: "w-full shrink-0 justify-center sm:w-auto",
            })}
            prefetch={false}
          >
            Get Featured
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      {settings?.resolvedRecipient ? (
        <p className="text-xs text-muted-foreground">
          Reports currently go to {settings.resolvedRecipient} (
          {sourceLabel(settings.resolvedRecipientSource)}).
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Add a notification email or listing contact email so we can send
          reports.
        </p>
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <Button type="submit" disabled={saving || !hasChanges}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export default function NotificationsSettingsPanel({ accountEmail }) {
  const [businesses, setBusinesses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchOwnedBusinesses().then(({ data, error: fetchError }) => {
      if (!mounted) return;
      if (fetchError) {
        setError("Unable to load your businesses.");
        setBusinesses([]);
        return;
      }
      setBusinesses(Array.isArray(data) ? data : []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-4 md:p-5">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          About your emails
        </h2>
        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Account email</strong> is only
            for signing in. Change it in the{" "}
            <Link href="/settings?tab=account" className="text-primary underline">
              Account
            </Link>{" "}
            tab.
          </li>
          <li>
            <strong className="text-foreground">Listing contact email</strong>{" "}
            is shown on your public business page. Edit it from the listing
            contact section.
          </li>
          <li>
            <strong className="text-foreground">Notification email</strong> is
            optional. Use it when an owner or employee should get
            RadiatorRepairHub reports instead of the account or listing email.
          </li>
        </ul>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {businesses == null ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
      ) : businesses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Claim a listing to manage weekly reports and notification emails.
        </p>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <BusinessNotificationCard
              key={business.id}
              business={business}
              accountEmail={accountEmail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
