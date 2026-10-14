-- Optional per-listing review email note. Null means the standard message.
-- The API writes this with the service role after checking ownership.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS review_message_template text;

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_review_message_template_length;

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_review_message_template_length
  CHECK (
    review_message_template IS NULL
    OR char_length(review_message_template) BETWEEN 1 AND 2000
  );
