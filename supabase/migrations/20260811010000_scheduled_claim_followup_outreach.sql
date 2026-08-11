-- Add claim_followup to scheduled outreach campaigns and reservation logic.
-- Follow-up eligibility: unclaimed/able, invite sent >= 7 days ago, follow-up not sent.

ALTER TABLE public.outreach_schedule_campaigns
  DROP CONSTRAINT IF EXISTS outreach_schedule_campaigns_type_check;

ALTER TABLE public.outreach_schedule_campaigns
  ADD CONSTRAINT outreach_schedule_campaigns_type_check
  CHECK (
    outreach_type IN (
      'claim_invite'::public.outreach_type,
      'ownership_claim_invite'::public.outreach_type,
      'lead_claim_invite'::public.outreach_type,
      'claim_followup'::public.outreach_type
    )
  );

ALTER TABLE public.outreach_send_jobs
  DROP CONSTRAINT IF EXISTS outreach_send_jobs_type_check;

ALTER TABLE public.outreach_send_jobs
  ADD CONSTRAINT outreach_send_jobs_type_check
  CHECK (
    outreach_type IN (
      'claim_invite'::public.outreach_type,
      'ownership_claim_invite'::public.outreach_type,
      'lead_claim_invite'::public.outreach_type,
      'claim_followup'::public.outreach_type
    )
  );

ALTER TABLE public.outreach_send_deliveries
  DROP CONSTRAINT IF EXISTS outreach_send_deliveries_type_check;

ALTER TABLE public.outreach_send_deliveries
  ADD CONSTRAINT outreach_send_deliveries_type_check
  CHECK (
    outreach_type IN (
      'claim_invite'::public.outreach_type,
      'ownership_claim_invite'::public.outreach_type,
      'lead_claim_invite'::public.outreach_type,
      'claim_followup'::public.outreach_type
    )
  );

INSERT INTO public.outreach_schedule_campaigns (
  schedule_id,
  outreach_type,
  enabled,
  limit_count
)
SELECT
  schedule.id,
  'claim_followup'::public.outreach_type,
  false,
  25
FROM public.outreach_schedules AS schedule
WHERE schedule.scheduler_key = 'weekday-claim-invite-outreach'
ON CONFLICT (schedule_id, outreach_type) DO NOTHING;

CREATE OR REPLACE FUNCTION public.reserve_outreach_send_deliveries(
  p_send_job_id uuid,
  p_outreach_type public.outreach_type,
  p_limit_count integer
)
RETURNS SETOF public.outreach_send_deliveries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_existing_count integer;
  v_job_limit integer;
  v_needed integer;
BEGIN
  IF p_limit_count NOT IN (10, 25, 50, 75) THEN
    RAISE EXCEPTION 'Invalid outreach reservation limit';
  END IF;

  IF p_outreach_type NOT IN (
    'claim_invite'::public.outreach_type,
    'ownership_claim_invite'::public.outreach_type,
    'lead_claim_invite'::public.outreach_type,
    'claim_followup'::public.outreach_type
  ) THEN
    RAISE EXCEPTION 'Invalid scheduled outreach type';
  END IF;

  -- Serialize only candidate allocation; email delivery remains concurrent-safe.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('scheduled-claim-invite-outreach-reservation', 0)
  );

  SELECT job.limit_count
  INTO v_job_limit
  FROM public.outreach_send_jobs AS job
  WHERE job.id = p_send_job_id
    AND job.outreach_type = p_outreach_type
    AND job.status IN ('pending', 'running', 'failed')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Outreach send job is not reservable';
  END IF;

  IF v_job_limit <> p_limit_count THEN
    RAISE EXCEPTION 'Reservation limit must match the send job limit';
  END IF;

  SELECT count(*)
  INTO v_existing_count
  FROM public.outreach_send_deliveries AS delivery
  WHERE delivery.send_job_id = p_send_job_id
    AND delivery.status IN ('reserved', 'sending', 'sent');

  v_needed := GREATEST(p_limit_count - v_existing_count, 0);

  IF v_needed > 0 AND p_outreach_type = 'claim_followup'::public.outreach_type THEN
    INSERT INTO public.outreach_send_deliveries (
      send_job_id,
      business_id,
      outreach_type,
      status
    )
    SELECT
      p_send_job_id,
      business.id,
      p_outreach_type,
      'reserved'
    FROM public.outreach_business_list AS business
    WHERE business.claim_eligibility = 'able'
      AND business.claim_invite_sent_at IS NOT NULL
      AND business.claim_invite_sent_at <= (now() - interval '7 days')
      AND business.claim_followup_sent_at IS NULL
      AND NULLIF(btrim(business.email), '') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.outreach_send_deliveries AS active_delivery
        WHERE active_delivery.business_id = business.id
          AND active_delivery.status IN ('reserved', 'sending')
      )
    ORDER BY
      business.claim_invite_sent_at ASC NULLS LAST,
      business.total_score DESC NULLS LAST,
      business.reviews_count DESC NULLS LAST,
      business.id
    LIMIT v_needed
    ON CONFLICT DO NOTHING;
  ELSIF v_needed > 0 THEN
    INSERT INTO public.outreach_send_deliveries (
      send_job_id,
      business_id,
      outreach_type,
      status
    )
    SELECT
      p_send_job_id,
      business.id,
      p_outreach_type,
      'reserved'
    FROM public.outreach_business_list AS business
    WHERE business.claim_eligibility = 'able'
      AND business.claim_invite_sent_at IS NULL
      AND NULLIF(btrim(business.email), '') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.outreach_send_deliveries AS active_delivery
        WHERE active_delivery.business_id = business.id
          AND active_delivery.status IN ('reserved', 'sending')
      )
    ORDER BY
      business.total_score DESC NULLS LAST,
      business.reviews_count DESC NULLS LAST,
      business.id
    LIMIT v_needed
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN QUERY
  SELECT delivery.*
  FROM public.outreach_send_deliveries AS delivery
  WHERE delivery.send_job_id = p_send_job_id
  ORDER BY delivery.created_at, delivery.id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_outreach_send_deliveries(
  uuid,
  public.outreach_type,
  integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_outreach_send_deliveries(
  uuid,
  public.outreach_type,
  integer
) TO service_role;
