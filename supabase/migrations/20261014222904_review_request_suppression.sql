-- Allow a per-shop opt-out for review request emails.
-- This does not change weekly digest or outreach suppressions.

ALTER TABLE public.email_suppressions
  DROP CONSTRAINT IF EXISTS email_suppressions_type_check;

ALTER TABLE public.email_suppressions
  ADD CONSTRAINT email_suppressions_type_check
  CHECK (suppression_type IN ('weekly_digest', 'business_email', 'review_request'));
