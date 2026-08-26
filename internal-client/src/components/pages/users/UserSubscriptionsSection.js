import Link from "next/link";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import BusinessSubscriptionStatusBadge from "@/components/pages/businesses/BusinessSubscriptionStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function SubscriptionRow({ subscription }) {
  const business = subscription.business;
  const businessTitle = business?.title ?? "Business";

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BusinessDetailCard label="Business">
          {subscription.business_id ? (
            <Link
              href={`/businesses/${subscription.business_id}`}
              className="underline underline-offset-2"
            >
              {businessTitle}
            </Link>
          ) : (
            businessTitle
          )}
        </BusinessDetailCard>
        <BusinessDetailCard label="Status">
          <BusinessSubscriptionStatusBadge status={subscription.status} />
        </BusinessDetailCard>
        <BusinessDetailCard label="Current period end">
          {formatFullDate(subscription.current_period_end)}
        </BusinessDetailCard>
        <BusinessDetailCard label="Cancel at period end">
          {subscription.cancel_at_period_end ? "Yes" : "No"}
        </BusinessDetailCard>
        <BusinessDetailCard label="Created">
          {formatFullDate(subscription.created_at)}
        </BusinessDetailCard>
        <BusinessDetailCard label="Stripe subscription">
          {subscription.stripe_subscription_id ? (
            <span className="break-all font-mono text-xs">
              {subscription.stripe_subscription_id}
            </span>
          ) : (
            "—"
          )}
        </BusinessDetailCard>
      </dl>
    </div>
  );
}

export default function UserSubscriptionsSection({ subscriptions = [] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight">
        Featured subscriptions
        <span className="ml-2 font-normal text-muted-foreground">
          ({subscriptions.length})
        </span>
      </h2>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No Stripe subscriptions on file for this user.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {subscriptions.map((subscription) => (
            <SubscriptionRow
              key={subscription.id ?? subscription.stripe_subscription_id}
              subscription={subscription}
            />
          ))}
        </div>
      )}
    </section>
  );
}
