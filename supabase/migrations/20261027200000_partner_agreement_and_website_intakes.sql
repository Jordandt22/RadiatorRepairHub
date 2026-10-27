-- Partner agreement acceptances (logged at successful Partner checkout)
-- and owner website intake forms for Partner listings.

CREATE TABLE IF NOT EXISTS public.partner_agreement_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_uid uuid,
  customer_email text,
  agreement_version text NOT NULL,
  stripe_checkout_session_id text UNIQUE,
  stripe_subscription_id text,
  stripe_customer_id text,
  accepted_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_agreement_acceptances_business_id_idx
  ON public.partner_agreement_acceptances (business_id, accepted_at DESC);

ALTER TABLE public.partner_agreement_acceptances ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.partner_agreement_acceptances FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.partner_agreement_acceptances TO service_role;

DO $$ BEGIN
  CREATE TYPE public.partner_website_intake_status AS ENUM (
    'needs_info',
    'submitted'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.partner_website_intakes (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  status public.partner_website_intake_status NOT NULL DEFAULT 'needs_info',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_website_intakes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.partner_website_intakes FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.partner_website_intakes TO service_role;
