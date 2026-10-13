-- Partner checkout: listing flag, owner phone from Checkout, conditional claim,
-- and subscription state that turns is_partner on only for the partner price.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_partner boolean NOT NULL DEFAULT false;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone text;

DROP FUNCTION IF EXISTS public.apply_stripe_subscription_state(
  text, text, text, uuid, uuid, text, timestamp with time zone, boolean
);

CREATE OR REPLACE FUNCTION public.apply_stripe_subscription_state(
  p_stripe_subscription_id text,
  p_stripe_customer_id text,
  p_stripe_price_id text,
  p_business_id uuid,
  p_owner_uid uuid,
  p_status text,
  p_current_period_end timestamp with time zone,
  p_cancel_at_period_end boolean,
  p_partner_price_id text
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
  SET
    is_featured = EXISTS (
      SELECT 1
      FROM public.business_subscriptions s
      WHERE s.business_id = v_business_id
        AND s.status IN ('active', 'trialing', 'past_due')
    ),
    is_partner = EXISTS (
      SELECT 1
      FROM public.business_subscriptions s
      WHERE s.business_id = v_business_id
        AND s.status IN ('active', 'trialing', 'past_due')
        AND p_partner_price_id IS NOT NULL
        AND length(btrim(p_partner_price_id)) > 0
        AND s.stripe_price_id = p_partner_price_id
    )
  WHERE id = v_business_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.apply_stripe_subscription_state(
  text, text, text, uuid, uuid, text, timestamp with time zone, boolean, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_stripe_subscription_state(
  text, text, text, uuid, uuid, text, timestamp with time zone, boolean, text
) TO service_role;

-- Claim only when the listing is still unclaimed. Returns true when this user
-- owns the listing afterward (including a webhook retry).
CREATE OR REPLACE FUNCTION public.claim_unclaimed_business(
  p_business_id uuid,
  p_uid uuid,
  p_phone text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_business_id IS NULL OR p_uid IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.users (uid, role)
  VALUES (p_uid, 'business_owner'::public.user_roles)
  ON CONFLICT (uid) DO NOTHING;

  IF p_phone IS NOT NULL AND length(btrim(p_phone)) > 0 THEN
    UPDATE public.users
    SET phone = btrim(p_phone)
    WHERE uid = p_uid;
  END IF;

  UPDATE public.businesses
  SET
    is_claimed = true,
    owner_uid = p_uid,
    last_edited_at = coalesce(last_edited_at, now())
  WHERE id = p_business_id
    AND COALESCE(is_claimed, false) = false
    AND owner_uid IS NULL;

  RETURN EXISTS (
    SELECT 1
    FROM public.businesses
    WHERE id = p_business_id
      AND is_claimed = true
      AND owner_uid = p_uid
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.claim_unclaimed_business(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_unclaimed_business(uuid, uuid, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.auth_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT id
  FROM auth.users
  WHERE p_email IS NOT NULL
    AND length(btrim(p_email)) > 0
    AND lower(email) = lower(btrim(p_email))
  LIMIT 1;
$function$;

REVOKE EXECUTE ON FUNCTION public.auth_user_id_by_email(text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.auth_user_id_by_email(text)
  TO service_role;
