-- Domain and API key for a partner listing's client website.
-- The internal tool reads the key back. Clients have no direct access.

CREATE TABLE IF NOT EXISTS public.partner_sites (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  domain text,
  api_key text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partner_sites_domain_check CHECK (
    domain IS NULL OR length(btrim(domain)) BETWEEN 4 AND 253
  ),
  CONSTRAINT partner_sites_api_key_check CHECK (
    api_key IS NULL OR length(btrim(api_key)) BETWEEN 16 AND 200
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS partner_sites_domain_key
  ON public.partner_sites (domain)
  WHERE domain IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS partner_sites_api_key_key
  ON public.partner_sites (api_key)
  WHERE api_key IS NOT NULL;

ALTER TABLE public.partner_sites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.partner_sites FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.partner_sites TO service_role;
