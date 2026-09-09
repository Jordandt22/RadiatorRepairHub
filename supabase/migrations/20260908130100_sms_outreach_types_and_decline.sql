-- Remap any early phone-channel rows that reused email campaign types,
-- then track SMS invite / follow-up / decline with dedicated types.

UPDATE "public"."outreach_history"
SET outreach_type = 'sms_claim_invite'::"public"."outreach_type"
WHERE message_type = 'phone'::"public"."outreach_message_type"
  AND outreach_type IN (
    'claim_invite'::"public"."outreach_type",
    'ownership_claim_invite'::"public"."outreach_type",
    'lead_claim_invite'::"public"."outreach_type"
  );

UPDATE "public"."outreach_history"
SET outreach_type = 'sms_custom_claim_invite'::"public"."outreach_type"
WHERE message_type = 'phone'::"public"."outreach_message_type"
  AND outreach_type = 'custom_claim_invite'::"public"."outreach_type";

UPDATE "public"."outreach_history"
SET outreach_type = 'sms_claim_followup'::"public"."outreach_type"
WHERE message_type = 'phone'::"public"."outreach_message_type"
  AND outreach_type = 'claim_followup'::"public"."outreach_type";

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
    WHEN (
      (b.email IS NOT NULL AND length(btrim(b.email)) > 0)
      AND b.email_status IS DISTINCT FROM 'suspicious'::"public"."business_email_status"
      AND email_dupes.email IS NULL
    )
    AND (
      (b.phone IS NOT NULL AND length(btrim(b.phone)) > 0)
      AND b.phone_status IS DISTINCT FROM 'suspicious'::"public"."business_phone_status"
      AND phone_dupes.phone IS NULL
    ) THEN 'both_able'
    WHEN (
      (b.email IS NOT NULL AND length(btrim(b.email)) > 0)
      AND b.email_status IS DISTINCT FROM 'suspicious'::"public"."business_email_status"
      AND email_dupes.email IS NULL
    ) THEN 'email_able'
    WHEN (
      (b.phone IS NOT NULL AND length(btrim(b.phone)) > 0)
      AND b.phone_status IS DISTINCT FROM 'suspicious'::"public"."business_phone_status"
      AND phone_dupes.phone IS NULL
    ) THEN 'phone_able'
    WHEN b.email_status = 'suspicious'::"public"."business_email_status" THEN 'email_review'
    WHEN b.phone_status = 'suspicious'::"public"."business_phone_status" THEN 'phone_review'
    WHEN email_dupes.email IS NOT NULL THEN 'duplicate_email'
    WHEN phone_dupes.phone IS NOT NULL THEN 'duplicate_phone'
    ELSE 'no_contact'
  END AS claim_eligibility,
  ci.sent_at AS claim_invite_sent_at,
  wo.sent_at AS website_offer_sent_at,
  cf.sent_at AS claim_followup_sent_at,
  b.phone_status,
  city.name AS city_name,
  st.code AS state_code,
  sms_ci.sent_at AS sms_claim_invite_sent_at,
  sms_cf.sent_at AS sms_claim_followup_sent_at,
  sms_d.sent_at AS sms_declined_at
FROM "public"."businesses" b
LEFT JOIN "public"."cities" city ON city.id = b.city_id
LEFT JOIN "public"."states" st ON st.id = b.state_id
LEFT JOIN (
  SELECT email
  FROM "public"."businesses"
  WHERE email IS NOT NULL AND length(btrim(email)) > 0
  GROUP BY email
  HAVING count(*) > 1
) email_dupes ON email_dupes.email = b.email
LEFT JOIN (
  SELECT phone
  FROM "public"."businesses"
  WHERE phone IS NOT NULL AND length(btrim(phone)) > 0
  GROUP BY phone
  HAVING count(*) > 1
) phone_dupes ON phone_dupes.phone = b.phone
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
  AND cf.outreach_type = 'claim_followup'::"public"."outreach_type"
LEFT JOIN (
  SELECT business_id, MIN(sent_at) AS sent_at
  FROM "public"."outreach_history"
  WHERE message_type = 'phone'::"public"."outreach_message_type"
    AND outreach_type IN (
      'sms_claim_invite'::"public"."outreach_type",
      'sms_custom_claim_invite'::"public"."outreach_type"
    )
  GROUP BY business_id
) sms_ci ON sms_ci.business_id = b.id
LEFT JOIN "public"."outreach_history" sms_cf
  ON sms_cf.business_id = b.id
  AND sms_cf.message_type = 'phone'::"public"."outreach_message_type"
  AND sms_cf.outreach_type = 'sms_claim_followup'::"public"."outreach_type"
LEFT JOIN "public"."outreach_history" sms_d
  ON sms_d.business_id = b.id
  AND sms_d.message_type = 'phone'::"public"."outreach_message_type"
  AND sms_d.outreach_type = 'sms_declined'::"public"."outreach_type";

ALTER VIEW "public"."outreach_business_list" OWNER TO "postgres";

GRANT SELECT ON TABLE "public"."outreach_business_list" TO "anon";
GRANT SELECT ON TABLE "public"."outreach_business_list" TO "authenticated";
GRANT SELECT ON TABLE "public"."outreach_business_list" TO "service_role";
