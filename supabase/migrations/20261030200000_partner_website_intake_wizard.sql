-- Partner website intake wizard: draft steps, priority window, day-2 reminder.

ALTER TABLE public.partner_website_intakes
  ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS priority_until timestamp with time zone,
  ADD COLUMN IF NOT EXISTS current_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reminder_2d_sent_at timestamp with time zone;

UPDATE public.partner_website_intakes
SET
  started_at = COALESCE(started_at, updated_at, now()),
  priority_until = COALESCE(priority_until, COALESCE(started_at, updated_at, now()) + interval '7 days')
WHERE started_at IS NULL OR priority_until IS NULL;

ALTER TABLE public.partner_website_intakes
  ALTER COLUMN started_at SET DEFAULT now(),
  ALTER COLUMN started_at SET NOT NULL,
  ALTER COLUMN priority_until SET NOT NULL;

ALTER TABLE public.partner_website_intakes
  DROP CONSTRAINT IF EXISTS partner_website_intakes_current_step_check;

ALTER TABLE public.partner_website_intakes
  ADD CONSTRAINT partner_website_intakes_current_step_check
  CHECK (current_step >= 1 AND current_step <= 3);

CREATE INDEX IF NOT EXISTS partner_website_intakes_reminder_scan_idx
  ON public.partner_website_intakes (status, started_at)
  WHERE reminder_2d_sent_at IS NULL AND status = 'needs_info';
