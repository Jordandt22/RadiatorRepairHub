-- Lock down SECURITY DEFINER RPCs that are only meant for service_role / internals.
-- Default privileges previously granted EXECUTE to anon/authenticated/PUBLIC.

REVOKE EXECUTE ON FUNCTION public.complete_business_claim(uuid, uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_business_claim(uuid, uuid, uuid)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.ingest_claim_batch_job(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_claim_batch_job(uuid, uuid, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.ingest_finish_batch_job(
  uuid, uuid, text, text, jsonb, jsonb, jsonb, jsonb, boolean, boolean, boolean
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_finish_batch_job(
  uuid, uuid, text, text, jsonb, jsonb, jsonb, jsonb, boolean, boolean, boolean
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

-- Prevent future public.schema functions from auto-granting EXECUTE to API roles.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- Pin search_path on businesses_open_now (lint 0011).
CREATE OR REPLACE FUNCTION public.businesses_open_now()
RETURNS SETOF public.businesses
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  current_day text := to_char(now(), 'FMDay');
  current_time time := now()::time;
BEGIN
  RETURN QUERY
  SELECT b.*
  FROM public.businesses b
  JOIN public.business_hours bh ON bh.business_id = b.id
  WHERE lower(bh.day_of_week) = lower(current_day)
    AND bh.is_closed = false
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(bh.hours) AS h
      WHERE current_time >= (h->>'opening_time')::time
        AND current_time <= (h->>'closing_time')::time
    );
END;
$$;
