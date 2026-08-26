import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";
import BusinessSubscriptionStatusBadge from "@/components/pages/businesses/BusinessSubscriptionStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function SubscriptionRow({ subscription }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <BusinessDetailCard label="Stripe customer">
          {subscription.stripe_customer_id ? (
            <span className="break-all font-mono text-xs">
              {subscription.stripe_customer_id}
            </span>
          ) : (
            "—"
          )}
        </BusinessDetailCard>
        <BusinessDetailCard label="Stripe price">
          {subscription.stripe_price_id ? (
            <span className="break-all font-mono text-xs">
              {subscription.stripe_price_id}
            </span>
          ) : (
            "—"
          )}
        </BusinessDetailCard>
      </dl>
    </div>
  );
}

export default function BusinessSubscriptionsSection({
  subscriptions = [],
  title = "Featured subscription",
  emptyMessage = "No Stripe subscriptions on file for this listing.",
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight">
        {title}
        <span className="ml-2 font-normal text-muted-foreground">
          ({subscriptions.length})
        </span>
      </h2>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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
