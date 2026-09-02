-- Allow per-job chunk sizes on outreach send jobs (e.g. 50 in prod, 2 in development).
-- Campaign schedule options remain 10/25/50/75.

ALTER TABLE public.outreach_send_jobs
  DROP CONSTRAINT IF EXISTS outreach_send_jobs_limit_check;

ALTER TABLE public.outreach_send_jobs
  ADD CONSTRAINT outreach_send_jobs_limit_check
  CHECK (limit_count > 0 AND limit_count <= 75);
