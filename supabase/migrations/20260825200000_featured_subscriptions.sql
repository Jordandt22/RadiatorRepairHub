-- Paid Featured listings: Stripe-driven is_featured + subscription rows.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_businesses_featured_listing
  ON public.businesses (is_featured DESC, is_claimed DESC, reviews_count DESC);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_key
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.business_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_uid uuid NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_price_id text,
  status text NOT NULL,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_subscriptions_stripe_subscription_id_key
    UNIQUE (stripe_subscription_id)
);

CREATE INDEX IF NOT EXISTS business_subscriptions_owner_uid_idx
  ON public.business_subscriptions (owner_uid);

CREATE INDEX IF NOT EXISTS business_subscriptions_business_id_idx
  ON public.business_subscriptions (business_id);

CREATE UNIQUE INDEX IF NOT EXISTS business_subscriptions_one_live_per_business
  ON public.business_subscriptions (business_id)
  WHERE status IN ('active', 'trialing', 'past_due', 'incomplete');

ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.business_subscriptions TO service_role;

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

  IF v_business_id IS NULL OR v_owner_uid IS NULL THEN
    RAISE EXCEPTION 'missing_business_or_owner';
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
    COALESCE(p_status, 'incomplete'),
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
