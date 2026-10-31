-- Expand partner website intake wizard to 4 steps (services is its own step).

ALTER TABLE public.partner_website_intakes
  DROP CONSTRAINT IF EXISTS partner_website_intakes_current_step_check;

-- Remap previous step 3 (extras) to step 4.
UPDATE public.partner_website_intakes
SET current_step = 4
WHERE current_step = 3;

ALTER TABLE public.partner_website_intakes
  ADD CONSTRAINT partner_website_intakes_current_step_check
  CHECK (current_step >= 1 AND current_step <= 4);
