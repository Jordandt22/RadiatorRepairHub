-- Twilio Lookup line type, stored separately from Phone Cleaner phone_status.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS phone_line_type text,
  ADD COLUMN IF NOT EXISTS phone_carrier text,
  ADD COLUMN IF NOT EXISTS phone_line_type_checked_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_businesses_phone_line_type_unchecked
  ON public.businesses (id)
  WHERE phone_line_type_checked_at IS NULL
    AND phone IS NOT NULL
    AND length(btrim(phone)) > 0;
