-- Weekday claim-invite outreach scheduler, durable runs, and send reservations.

CREATE TABLE IF NOT EXISTS public.outreach_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduler_key text NOT NULL UNIQUE,
  enabled boolean DEFAULT false NOT NULL,
  local_time time without time zone DEFAULT '08:00:00'::time NOT NULL,
  timezone text DEFAULT 'America/Los_Angeles'::text NOT NULL,
  weekdays smallint[] DEFAULT ARRAY[1, 2, 3, 4, 5]::smallint[] NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT outreach_schedules_singleton_key_check
    CHECK (scheduler_key = 'weekday-claim-invite-outreach'),
  CONSTRAINT outreach_schedules_timezone_check
    CHECK (timezone = 'America/Los_Angeles'),
  CONSTRAINT outreach_schedules_weekdays_check
    CHECK (
      cardinality(weekdays) > 0
      AND weekdays <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
);

CREATE TABLE IF NOT EXISTS public.outreach_schedule_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid NOT NULL REFERENCES public.outreach_schedules(id) ON DELETE CASCADE,
  outreach_type public.outreach_type NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  limit_count integer DEFAULT 25 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT outreach_schedule_campaigns_schedule_type_key
    UNIQUE (schedule_id, outreach_type),
  CONSTRAINT outreach_schedule_campaigns_type_check
    CHECK (
      outreach_type IN (
        'claim_invite'::public.outreach_type,
        'ownership_claim_invite'::public.outreach_type,
        'lead_claim_invite'::public.outreach_type
      )
    ),
  CONSTRAINT outreach_schedule_campaigns_limit_check
    CHECK (limit_count IN (10, 25, 50, 75))
);

CREATE TABLE IF NOT EXISTS public.outreach_schedule_runs (
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
  CONSTRAINT outreach_schedule_runs_trigger_scheduled_key
    UNIQUE (trigger, scheduled_for),
  CONSTRAINT outreach_schedule_runs_trigger_check
    CHECK (trigger IN ('scheduled', 'manual')),
  CONSTRAINT outreach_schedule_runs_status_check
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  CONSTRAINT outreach_schedule_runs_counts_check
    CHECK (
      selected_count >= 0
      AND sent_count >= 0
      AND skipped_count >= 0
      AND failed_count >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.outreach_send_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.outreach_schedule_runs(id) ON DELETE CASCADE,
  outreach_type public.outreach_type NOT NULL,
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
  CONSTRAINT outreach_send_jobs_run_type_key UNIQUE (run_id, outreach_type),
  CONSTRAINT outreach_send_jobs_id_type_key UNIQUE (id, outreach_type),
  CONSTRAINT outreach_send_jobs_bullmq_job_id_key UNIQUE (bullmq_job_id),
  CONSTRAINT outreach_send_jobs_type_check
    CHECK (
      outreach_type IN (
        'claim_invite'::public.outreach_type,
        'ownership_claim_invite'::public.outreach_type,
        'lead_claim_invite'::public.outreach_type
      )
    ),
  CONSTRAINT outreach_send_jobs_status_check
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  CONSTRAINT outreach_send_jobs_limit_check
    CHECK (limit_count IN (10, 25, 50, 75)),
  CONSTRAINT outreach_send_jobs_counts_check
    CHECK (
      selected_count >= 0
      AND sent_count >= 0
      AND skipped_count >= 0
      AND failed_count >= 0
      AND attempt_count >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.outreach_send_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  send_job_id uuid NOT NULL,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  outreach_type public.outreach_type NOT NULL,
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
  CONSTRAINT outreach_send_deliveries_job_type_fkey
    FOREIGN KEY (send_job_id, outreach_type)
    REFERENCES public.outreach_send_jobs(id, outreach_type)
    ON DELETE CASCADE,
  CONSTRAINT outreach_send_deliveries_job_business_key
    UNIQUE (send_job_id, business_id),
  CONSTRAINT outreach_send_deliveries_type_check
    CHECK (
      outreach_type IN (
        'claim_invite'::public.outreach_type,
        'ownership_claim_invite'::public.outreach_type,
        'lead_claim_invite'::public.outreach_type
      )
    ),
  CONSTRAINT outreach_send_deliveries_status_check
    CHECK (status IN ('reserved', 'sending', 'sent', 'skipped', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_outreach_schedule_runs_created_at
  ON public.outreach_schedule_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_schedule_runs_status
  ON public.outreach_schedule_runs (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_outreach_schedule_runs_bullmq_job_id
  ON public.outreach_schedule_runs (bullmq_job_id)
  WHERE bullmq_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outreach_send_jobs_run_id
  ON public.outreach_send_jobs (run_id);
CREATE INDEX IF NOT EXISTS idx_outreach_send_jobs_status
  ON public.outreach_send_jobs (status);
CREATE INDEX IF NOT EXISTS idx_outreach_send_deliveries_send_job_id
  ON public.outreach_send_deliveries (send_job_id);
CREATE INDEX IF NOT EXISTS idx_outreach_send_deliveries_business_id
  ON public.outreach_send_deliveries (business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_outreach_send_deliveries_active_business
  ON public.outreach_send_deliveries (business_id)
  WHERE status IN ('reserved', 'sending');

ALTER TABLE public.outreach_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_schedule_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_schedule_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_send_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_send_deliveries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.outreach_schedules FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.outreach_schedule_campaigns FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.outreach_schedule_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.outreach_send_jobs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.outreach_send_deliveries FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.outreach_schedules TO service_role;
GRANT ALL ON TABLE public.outreach_schedule_campaigns TO service_role;
GRANT ALL ON TABLE public.outreach_schedule_runs TO service_role;
GRANT ALL ON TABLE public.outreach_send_jobs TO service_role;
GRANT ALL ON TABLE public.outreach_send_deliveries TO service_role;

WITH schedule_row AS (
  INSERT INTO public.outreach_schedules (
    scheduler_key,
    enabled,
    local_time,
    timezone,
    weekdays
  )
  VALUES (
    'weekday-claim-invite-outreach',
    false,
    '08:00:00'::time,
    'America/Los_Angeles',
    ARRAY[1, 2, 3, 4, 5]::smallint[]
  )
  ON CONFLICT (scheduler_key) DO UPDATE
    SET scheduler_key = EXCLUDED.scheduler_key
  RETURNING id
)
INSERT INTO public.outreach_schedule_campaigns (
  schedule_id,
  outreach_type,
  enabled,
  limit_count
)
SELECT
  schedule_row.id,
  campaign.outreach_type::public.outreach_type,
  true,
  25
FROM schedule_row
CROSS JOIN (
  VALUES
    ('claim_invite'),
    ('ownership_claim_invite'),
    ('lead_claim_invite')
) AS campaign(outreach_type)
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
    'lead_claim_invite'::public.outreach_type
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

  IF v_needed > 0 THEN
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
