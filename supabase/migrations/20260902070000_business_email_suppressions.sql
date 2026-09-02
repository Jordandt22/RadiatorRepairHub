-- Broaden email suppressions so one unsubscribe can stop outreach + weekly digests
-- (Quick Contact and other transactional mail are unaffected).

ALTER TABLE public.email_suppressions
  DROP CONSTRAINT IF EXISTS email_suppressions_type_check;

ALTER TABLE public.email_suppressions
  ADD CONSTRAINT email_suppressions_type_check
  CHECK (suppression_type IN ('weekly_digest', 'business_email'));

CREATE OR REPLACE FUNCTION public.reserve_digest_deliveries(
  p_send_job_id uuid,
  p_digest_segment text,
  p_limit_count integer
)
RETURNS SETOF public.digest_send_deliveries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_existing_count integer;
  v_job_limit integer;
  v_needed integer;
  v_week_start timestamptz;
  v_activity_start date;
BEGIN
  IF p_digest_segment NOT IN ('unclaimed', 'claimed') THEN
    RAISE EXCEPTION 'Invalid digest segment';
  END IF;

  IF p_limit_count IS NULL OR p_limit_count < 1 OR p_limit_count > 10000 THEN
    RAISE EXCEPTION 'Invalid digest reservation limit';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended('weekly-digest-reservation', 0)
  );

  SELECT job.limit_count
  INTO v_job_limit
  FROM public.digest_send_jobs AS job
  WHERE job.id = p_send_job_id
    AND job.digest_segment = p_digest_segment
    AND job.status IN ('pending', 'running', 'failed')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Digest send job is not reservable';
  END IF;

  IF v_job_limit <> p_limit_count THEN
    RAISE EXCEPTION 'Reservation limit must match the send job limit';
  END IF;

  v_week_start :=
    date_trunc('week', timezone('America/Los_Angeles', now()))
    AT TIME ZONE 'America/Los_Angeles';
  v_activity_start := (timezone('America/Los_Angeles', now()))::date - 6;

  SELECT count(*)
  INTO v_existing_count
  FROM public.digest_send_deliveries AS delivery
  WHERE delivery.send_job_id = p_send_job_id
    AND delivery.status IN ('reserved', 'sending', 'sent');

  v_needed := GREATEST(p_limit_count - v_existing_count, 0);

  IF v_needed > 0 THEN
    INSERT INTO public.digest_send_deliveries (
      send_job_id,
      business_id,
      digest_segment,
      status
    )
    SELECT
      p_send_job_id,
      business.id,
      p_digest_segment,
      'reserved'
    FROM public.digest_recipient_list AS business
    WHERE (
      (
        p_digest_segment = 'unclaimed'
        AND business.claim_eligibility = 'able'
        AND NULLIF(btrim(business.email), '') IS NOT NULL
        AND COALESCE((
          SELECT SUM(
            COALESCE(stats.impressions_search, 0)
            + COALESCE(stats.impressions_featured, 0)
            + COALESCE(stats.impressions_top_verified, 0)
            + COALESCE(stats.impressions_state, 0)
            + COALESCE(stats.impressions_city, 0)
            + COALESCE(stats.impressions_category, 0)
            + COALESCE(stats.impressions_nearby, 0)
            + COALESCE(stats.page_views, 0)
            + COALESCE(stats.phone_clicks, 0)
          )
          FROM public.business_stats AS stats
          WHERE stats.business_id = business.id
            AND stats.stat_date >= v_activity_start
        ), 0) > 0
        AND NOT EXISTS (
          SELECT 1
          FROM public.email_suppressions AS suppression
          WHERE suppression.business_id = business.id
            AND suppression.suppression_type IN ('weekly_digest', 'business_email')
            AND suppression.email = lower(btrim(business.email))
        )
      )
      OR (
        p_digest_segment = 'claimed'
        AND business.is_claimed IS TRUE
        AND business.weekly_digest_enabled IS TRUE
        AND COALESCE((
          SELECT SUM(
            COALESCE(stats.impressions_search, 0)
            + COALESCE(stats.impressions_featured, 0)
            + COALESCE(stats.impressions_top_verified, 0)
            + COALESCE(stats.impressions_state, 0)
            + COALESCE(stats.impressions_city, 0)
            + COALESCE(stats.impressions_category, 0)
            + COALESCE(stats.impressions_nearby, 0)
            + COALESCE(stats.page_views, 0)
            + COALESCE(stats.phone_clicks, 0)
          )
          FROM public.business_stats AS stats
          WHERE stats.business_id = business.id
            AND stats.stat_date >= v_activity_start
        ), 0) > 0
        AND NOT EXISTS (
          SELECT 1
          FROM public.email_suppressions AS suppression
          WHERE suppression.business_id = business.id
            AND suppression.suppression_type IN ('weekly_digest', 'business_email')
            AND suppression.email IN (
              lower(btrim(COALESCE(business.notification_email, ''))),
              lower(btrim(COALESCE(business.email, '')))
            )
        )
      )
    )
      AND NOT EXISTS (
        SELECT 1
        FROM public.digest_history AS history
        WHERE history.business_id = business.id
          AND history.sent_at >= v_week_start
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.digest_send_deliveries AS active_delivery
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
  FROM public.digest_send_deliveries AS delivery
  WHERE delivery.send_job_id = p_send_job_id
  ORDER BY delivery.created_at, delivery.id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_digest_deliveries(
  uuid,
  text,
  integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_digest_deliveries(
  uuid,
  text,
  integer
) TO service_role;

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
  IF p_limit_count IS NULL OR p_limit_count < 1 OR p_limit_count > 75 THEN
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
        FROM public.email_suppressions AS suppression
        WHERE suppression.business_id = business.id
          AND suppression.suppression_type IN ('weekly_digest', 'business_email')
          AND suppression.email = lower(btrim(business.email))
      )
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
        FROM public.email_suppressions AS suppression
        WHERE suppression.business_id = business.id
          AND suppression.suppression_type IN ('weekly_digest', 'business_email')
          AND suppression.email = lower(btrim(business.email))
      )
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
