-- Owner review emails. The API writes these with the service role after
-- checking ownership. Clients have no direct access.

CREATE TABLE IF NOT EXISTS public.review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_uid uuid NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  message text NOT NULL,
  review_url text NOT NULL,
  resend_email_id text,
  status text NOT NULL,
  error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT review_requests_status_check CHECK (status IN ('sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS review_requests_business_created_idx
  ON public.review_requests (business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS review_requests_sent_month_idx
  ON public.review_requests (business_id, created_at)
  WHERE status = 'sent';

ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.review_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.review_requests TO service_role;
