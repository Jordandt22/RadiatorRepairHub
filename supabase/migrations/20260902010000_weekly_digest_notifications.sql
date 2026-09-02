ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS notification_email text,
  ADD COLUMN IF NOT EXISTS weekly_digest_enabled boolean NOT NULL DEFAULT true;

DO $$ BEGIN
  ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_notification_email_check
    CHECK (
      notification_email IS NULL
      OR length(btrim(notification_email)) BETWEEN 3 AND 254
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email text NOT NULL,
  suppression_type text NOT NULL,
  source text DEFAULT 'unsubscribe_link'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT email_suppressions_type_check
    CHECK (suppression_type = 'weekly_digest'),
  CONSTRAINT email_suppressions_source_check
    CHECK (source IN ('unsubscribe_link', 'settings', 'admin')),
  CONSTRAINT email_suppressions_business_email_type_key
    UNIQUE (business_id, email, suppression_type)
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_lookup
  ON public.email_suppressions (business_id, suppression_type, email);

CREATE TABLE IF NOT EXISTS public.digest_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduler_key text NOT NULL UNIQUE,
  enabled boolean DEFAULT false NOT NULL,
  local_time time without time zone DEFAULT '09:00:00'::time NOT NULL,
  timezone text DEFAULT 'America/Los_Angeles'::text NOT NULL,
  weekday smallint DEFAULT 1 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT digest_schedules_singleton_key_check
    CHECK (scheduler_key = 'weekly-digest'),
  CONSTRAINT digest_schedules_timezone_check
    CHECK (timezone = 'America/Los_Angeles'),
  CONSTRAINT digest_schedules_weekday_check
    CHECK (weekday BETWEEN 0 AND 6)
);

CREATE TABLE IF NOT EXISTS public.digest_schedule_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid NOT NULL REFERENCES public.digest_schedules(id) ON DELETE CASCADE,
  digest_segment text NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  limit_count integer DEFAULT 5000 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT digest_schedule_campaigns_schedule_segment_key
    UNIQUE (schedule_id, digest_segment),
  CONSTRAINT digest_schedule_campaigns_segment_check
    CHECK (digest_segment IN ('unclaimed', 'claimed')),
  CONSTRAINT digest_schedule_campaigns_limit_check
    CHECK (limit_count > 0 AND limit_count <= 10000)
);

CREATE TABLE IF NOT EXISTS public.digest_schedule_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger text DEFAULT 'scheduled'::text NOT NULL,
  scheduled_for timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  config_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
  bullmq_job_id text,
  selected_count integer DEFAULT 0 NOT NULL,
  sent_count integer DEFAULT 0 NOT NULL,
  skipped_count integer DEFAULT 0 NOT NULL,
  failed_count integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  failed_at timestamp with time zone,
  CONSTRAINT digest_schedule_runs_trigger_scheduled_key
    UNIQUE (trigger, scheduled_for),
  CONSTRAINT digest_schedule_runs_trigger_check
    CHECK (trigger IN ('scheduled', 'manual')),
  CONSTRAINT digest_schedule_runs_status_check
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  CONSTRAINT digest_schedule_runs_counts_check
    CHECK (
      selected_count >= 0
      AND sent_count >= 0
      AND skipped_count >= 0
      AND failed_count >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.digest_send_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.digest_schedule_runs(id) ON DELETE CASCADE,
  digest_segment text NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  bullmq_job_id text,
  limit_count integer NOT NULL,
  selected_count integer DEFAULT 0 NOT NULL,
  sent_count integer DEFAULT 0 NOT NULL,
  skipped_count integer DEFAULT 0 NOT NULL,
  failed_count integer DEFAULT 0 NOT NULL,
  attempt_count integer DEFAULT 0 NOT NULL,
  result_payload jsonb,
  failed_data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  failed_at timestamp with time zone,
  CONSTRAINT digest_send_jobs_run_segment_key UNIQUE (run_id, digest_segment),
  CONSTRAINT digest_send_jobs_id_segment_key UNIQUE (id, digest_segment),
  CONSTRAINT digest_send_jobs_bullmq_job_id_key UNIQUE (bullmq_job_id),
  CONSTRAINT digest_send_jobs_segment_check
    CHECK (digest_segment IN ('unclaimed', 'claimed')),
  CONSTRAINT digest_send_jobs_status_check
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cleared')),
  CONSTRAINT digest_send_jobs_limit_check
    CHECK (limit_count > 0 AND limit_count <= 10000),
  CONSTRAINT digest_send_jobs_counts_check
    CHECK (
      selected_count >= 0
      AND sent_count >= 0
      AND skipped_count >= 0
      AND failed_count >= 0
      AND attempt_count >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.digest_send_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  send_job_id uuid NOT NULL,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  digest_segment text NOT NULL,
  status text DEFAULT 'reserved'::text NOT NULL,
  recipient text,
  provider_message_id text,
  idempotency_key text,
  error_data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  started_at timestamp with time zone,
  sent_at timestamp with time zone,
  completed_at timestamp with time zone,
  failed_at timestamp with time zone,
  CONSTRAINT digest_send_deliveries_job_segment_fkey
    FOREIGN KEY (send_job_id, digest_segment)
    REFERENCES public.digest_send_jobs(id, digest_segment)
    ON DELETE CASCADE,
  CONSTRAINT digest_send_deliveries_job_business_key
    UNIQUE (send_job_id, business_id),
  CONSTRAINT digest_send_deliveries_segment_check
    CHECK (digest_segment IN ('unclaimed', 'claimed')),
  CONSTRAINT digest_send_deliveries_status_check
    CHECK (status IN ('reserved', 'sending', 'sent', 'skipped', 'failed'))
);

CREATE TABLE IF NOT EXISTS public.digest_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  digest_segment text NOT NULL,
  recipient text,
  subject text,
  provider text DEFAULT 'resend'::text,
  provider_message_id text,
  send_job_id uuid,
  sent_at timestamp with time zone DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  CONSTRAINT digest_history_segment_check
    CHECK (digest_segment IN ('unclaimed', 'claimed'))
);

CREATE INDEX IF NOT EXISTS idx_digest_schedule_runs_created_at
  ON public.digest_schedule_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digest_schedule_runs_status
  ON public.digest_schedule_runs (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_digest_schedule_runs_bullmq_job_id
  ON public.digest_schedule_runs (bullmq_job_id)
  WHERE bullmq_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_digest_send_jobs_run_id
  ON public.digest_send_jobs (run_id);
CREATE INDEX IF NOT EXISTS idx_digest_send_jobs_status
  ON public.digest_send_jobs (status);
CREATE INDEX IF NOT EXISTS idx_digest_send_deliveries_send_job_id
  ON public.digest_send_deliveries (send_job_id);
CREATE INDEX IF NOT EXISTS idx_digest_send_deliveries_business_id
  ON public.digest_send_deliveries (business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_digest_send_deliveries_active_business
  ON public.digest_send_deliveries (business_id)
  WHERE status IN ('reserved', 'sending');
CREATE INDEX IF NOT EXISTS idx_digest_history_business_sent_at
  ON public.digest_history (business_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_digest_history_send_job_id
  ON public.digest_history (send_job_id)
  WHERE send_job_id IS NOT NULL;

CREATE OR REPLACE VIEW public.digest_recipient_list
WITH (security_invoker = on) AS
SELECT
  b.id,
  b.title,
  b.slug,
  b.email,
  b.notification_email,
  b.weekly_digest_enabled,
  b.is_claimed,
  b.is_featured,
  b.owner_uid,
  b.total_score,
  b.reviews_count,
  CASE
    WHEN b.is_claimed IS TRUE THEN 'claimed'
    WHEN b.email IS NULL OR length(btrim(b.email)) = 0 THEN 'no_email'
    WHEN b.email_status = 'suspicious'::public.business_email_status THEN 'email_review'
    WHEN dupes.email IS NOT NULL THEN 'duplicate_email'
    ELSE 'able'
  END AS claim_eligibility
FROM public.businesses b
LEFT JOIN (
  SELECT email
  FROM public.businesses
  WHERE email IS NOT NULL AND length(btrim(email)) > 0
  GROUP BY email
  HAVING count(*) > 1
) dupes ON dupes.email = b.email;

ALTER VIEW public.digest_recipient_list OWNER TO postgres;

GRANT SELECT ON TABLE public.digest_recipient_list TO service_role;
REVOKE ALL ON TABLE public.digest_recipient_list FROM PUBLIC, anon, authenticated;

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_schedule_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_schedule_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_send_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_send_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_suppressions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.digest_schedules FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.digest_schedule_campaigns FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.digest_schedule_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.digest_send_jobs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.digest_send_deliveries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.digest_history FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.email_suppressions TO service_role;
GRANT ALL ON TABLE public.digest_schedules TO service_role;
GRANT ALL ON TABLE public.digest_schedule_campaigns TO service_role;
GRANT ALL ON TABLE public.digest_schedule_runs TO service_role;
GRANT ALL ON TABLE public.digest_send_jobs TO service_role;
GRANT ALL ON TABLE public.digest_send_deliveries TO service_role;
GRANT ALL ON TABLE public.digest_history TO service_role;

WITH schedule_row AS (
  INSERT INTO public.digest_schedules (
    scheduler_key,
    enabled,
    local_time,
    timezone,
    weekday
  )
  VALUES (
    'weekly-digest',
    false,
    '09:00:00'::time,
    'America/Los_Angeles',
    1
  )
  ON CONFLICT (scheduler_key) DO UPDATE
    SET scheduler_key = EXCLUDED.scheduler_key
  RETURNING id
)
INSERT INTO public.digest_schedule_campaigns (
  schedule_id,
  digest_segment,
  enabled,
  limit_count
)
SELECT
  schedule_row.id,
  campaign.digest_segment,
  true,
  5000
FROM schedule_row
CROSS JOIN (
  VALUES
    ('unclaimed'),
    ('claimed')
) AS campaign(digest_segment)
ON CONFLICT (schedule_id, digest_segment) DO NOTHING;

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
            AND suppression.suppression_type = 'weekly_digest'
            AND suppression.email = lower(btrim(business.email))
        )
      )
      OR (
        p_digest_segment = 'claimed'
        AND business.is_claimed IS TRUE
        AND business.weekly_digest_enabled IS TRUE
        AND NOT EXISTS (
          SELECT 1
          FROM public.email_suppressions AS suppression
          WHERE suppression.business_id = business.id
            AND suppression.suppression_type = 'weekly_digest'
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

NOTIFY pgrst, 'reload schema';
