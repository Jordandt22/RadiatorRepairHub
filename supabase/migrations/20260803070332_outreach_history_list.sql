CREATE OR REPLACE VIEW "public"."outreach_history_list"
WITH (security_invoker = on) AS
SELECT
  h.outreach_history_id,
  h.business_id,
  h.message_type,
  h.outreach_type,
  h.recipient,
  h.subject,
  h.provider,
  h.provider_message_id,
  h.sent_at,
  h.sent_by,
  h.metadata,
  h.created_at,
  b.title,
  b.slug,
  b.email
FROM "public"."outreach_history" h
INNER JOIN "public"."businesses" b ON b.id = h.business_id;

ALTER VIEW "public"."outreach_history_list" OWNER TO "postgres";

GRANT SELECT ON TABLE "public"."outreach_history_list" TO "anon";
GRANT SELECT ON TABLE "public"."outreach_history_list" TO "authenticated";
GRANT SELECT ON TABLE "public"."outreach_history_list" TO "service_role";
