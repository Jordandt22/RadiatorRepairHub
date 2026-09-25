-- Prevent webhook races from failing when a second live Stripe subscription
-- is applied for a business that already has one live row (unique index
-- business_subscriptions_one_live_per_business). Supersede older live rows
-- before upserting the incoming subscription.

CREATE OR REPLACE FUNCTION public.apply_stripe_subscription_state(
  p_stripe_subscription_id text,
  p_stripe_customer_id text,
  p_stripe_price_id text,
  p_business_id uuid,
  p_owner_uid uuid,
  p_status text,
  p_current_period_end timestamp with time zone,
  p_cancel_at_period_end boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_business_id uuid;
  v_owner_uid uuid;
  v_status text;
BEGIN
  IF p_stripe_subscription_id IS NULL OR length(btrim(p_stripe_subscription_id)) = 0 THEN
    RAISE EXCEPTION 'missing_stripe_subscription_id';
  END IF;

  SELECT business_id, owner_uid
    INTO v_business_id, v_owner_uid
  FROM public.business_subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  v_business_id := COALESCE(p_business_id, v_business_id);
  v_owner_uid := COALESCE(p_owner_uid, v_owner_uid);
  v_status := COALESCE(p_status, 'incomplete');

  IF v_business_id IS NULL OR v_owner_uid IS NULL THEN
    RAISE EXCEPTION 'missing_business_or_owner';
  END IF;

  -- Only one live subscription per business is allowed. When applying a live
  -- status for this Stripe subscription, cancel any other live rows first.
  IF v_status IN ('active', 'trialing', 'past_due', 'incomplete') THEN
    UPDATE public.business_subscriptions
    SET
      status = 'canceled',
      cancel_at_period_end = true,
      updated_at = now()
    WHERE business_id = v_business_id
      AND stripe_subscription_id IS DISTINCT FROM p_stripe_subscription_id
      AND status IN ('active', 'trialing', 'past_due', 'incomplete');
  END IF;

  INSERT INTO public.business_subscriptions (
    business_id,
    owner_uid,
    stripe_subscription_id,
    stripe_customer_id,
    stripe_price_id,
    status,
    current_period_end,
    cancel_at_period_end,
    updated_at
  )
  VALUES (
    v_business_id,
    v_owner_uid,
    p_stripe_subscription_id,
    COALESCE(p_stripe_customer_id, ''),
    p_stripe_price_id,
    v_status,
    p_current_period_end,
    COALESCE(p_cancel_at_period_end, false),
    now()
  )
  ON CONFLICT (stripe_subscription_id) DO UPDATE
  SET
    business_id = EXCLUDED.business_id,
    owner_uid = EXCLUDED.owner_uid,
    stripe_customer_id = CASE
      WHEN EXCLUDED.stripe_customer_id <> '' THEN EXCLUDED.stripe_customer_id
      ELSE public.business_subscriptions.stripe_customer_id
    END,
    stripe_price_id = COALESCE(EXCLUDED.stripe_price_id, public.business_subscriptions.stripe_price_id),
    status = EXCLUDED.status,
    current_period_end = COALESCE(EXCLUDED.current_period_end, public.business_subscriptions.current_period_end),
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = now();

  IF p_stripe_customer_id IS NOT NULL AND length(btrim(p_stripe_customer_id)) > 0 THEN
    UPDATE public.users
    SET stripe_customer_id = p_stripe_customer_id
    WHERE uid = v_owner_uid
      AND (stripe_customer_id IS NULL OR stripe_customer_id = p_stripe_customer_id);
  END IF;

  UPDATE public.businesses
  SET is_featured = EXISTS (
    SELECT 1
    FROM public.business_subscriptions s
    WHERE s.business_id = v_business_id
      AND s.status IN ('active', 'trialing', 'past_due')
  )
  WHERE id = v_business_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.apply_stripe_subscription_state(
  text, text, text, uuid, uuid, text, timestamp with time zone, boolean
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_stripe_subscription_state(
  text, text, text, uuid, uuid, text, timestamp with time zone, boolean
) TO service_role;
