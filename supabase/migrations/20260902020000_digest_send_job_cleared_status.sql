ALTER TABLE public.digest_send_jobs
  DROP CONSTRAINT IF EXISTS digest_send_jobs_status_check;

ALTER TABLE public.digest_send_jobs
  ADD CONSTRAINT digest_send_jobs_status_check
  CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cleared'));
