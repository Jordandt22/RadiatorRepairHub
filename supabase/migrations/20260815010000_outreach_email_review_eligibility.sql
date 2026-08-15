-- Treat suspicious listing emails as unclaimable for outreach.
CREATE OR REPLACE VIEW "public"."outreach_business_list"
WITH (security_invoker = on) AS
SELECT
  b.id,
  b.title,
  b.slug,
  b.email,
  b.phone,
  b.website,
  b.is_claimed,
  b.owner_uid,
  b.total_score,
  b.reviews_count,
  b.created_at,
  CASE
    WHEN b.is_claimed IS TRUE THEN 'claimed'
    WHEN b.email IS NULL OR length(btrim(b.email)) = 0 THEN 'no_email'
    WHEN b.email_status = 'suspicious'::"public"."business_email_status" THEN 'email_review'
    WHEN dupes.email IS NOT NULL THEN 'duplicate_email'
    ELSE 'able'
  END AS claim_eligibility,
  ci.sent_at AS claim_invite_sent_at,
  wo.sent_at AS website_offer_sent_at,
  cf.sent_at AS claim_followup_sent_at
FROM "public"."businesses" b
LEFT JOIN (
  SELECT email
  FROM "public"."businesses"
  WHERE email IS NOT NULL AND length(btrim(email)) > 0
  GROUP BY email
  HAVING count(*) > 1
) dupes ON dupes.email = b.email
LEFT JOIN (
  SELECT business_id, MIN(sent_at) AS sent_at
  FROM "public"."outreach_history"
  WHERE message_type = 'email'::"public"."outreach_message_type"
    AND outreach_type IN (
      'claim_invite'::"public"."outreach_type",
      'ownership_claim_invite'::"public"."outreach_type",
      'lead_claim_invite'::"public"."outreach_type",
      'custom_claim_invite'::"public"."outreach_type"
    )
  GROUP BY business_id
) ci ON ci.business_id = b.id
LEFT JOIN "public"."outreach_history" wo
  ON wo.business_id = b.id
  AND wo.message_type = 'email'::"public"."outreach_message_type"
  AND wo.outreach_type = 'website_offer'::"public"."outreach_type"
LEFT JOIN "public"."outreach_history" cf
  ON cf.business_id = b.id
  AND cf.message_type = 'email'::"public"."outreach_message_type"
  AND cf.outreach_type = 'claim_followup'::"public"."outreach_type";

ALTER VIEW "public"."outreach_business_list" OWNER TO "postgres";

GRANT SELECT ON TABLE "public"."outreach_business_list" TO "anon";
GRANT SELECT ON TABLE "public"."outreach_business_list" TO "authenticated";
GRANT SELECT ON TABLE "public"."outreach_business_list" TO "service_role";
