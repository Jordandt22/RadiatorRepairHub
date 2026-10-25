-- When the review email for a website lead was sent.
ALTER TABLE public.website_leads
  ADD COLUMN IF NOT EXISTS review_sent_at timestamp with time zone;

-- Existing review-sent leads: use the earliest matching sent review email.
UPDATE public.website_leads AS lead
SET review_sent_at = sent.sent_at
FROM (
  SELECT
    business_id,
    lower(btrim(customer_email)) AS email,
    min(created_at) AS sent_at
  FROM public.review_requests
  WHERE status = 'sent'
    AND customer_email IS NOT NULL
    AND btrim(customer_email) <> ''
  GROUP BY business_id, lower(btrim(customer_email))
) AS sent
WHERE lead.status = 'review_sent'
  AND lead.review_sent_at IS NULL
  AND lead.customer_email IS NOT NULL
  AND lower(btrim(lead.customer_email)) = sent.email
  AND lead.business_id = sent.business_id;
