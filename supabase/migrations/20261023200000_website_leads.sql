-- Website contact-form leads for partner listings. The API writes these
-- with the service role after checking the listing is a claimed partner.
-- Clients have no direct access.

CREATE TABLE IF NOT EXISTS public.website_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  service text NOT NULL,
  vehicle text NOT NULL,
  issue text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT website_leads_status_check CHECK (status IN ('new', 'review_sent'))
);

CREATE INDEX IF NOT EXISTS website_leads_business_created_idx
  ON public.website_leads (business_id, created_at DESC);

ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.website_leads FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.website_leads TO service_role;
