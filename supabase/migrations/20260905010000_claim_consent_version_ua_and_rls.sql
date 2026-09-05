-- Extend claim consent audit fields and lock the table down to service_role.
-- consent_version records which checkbox language the user saw (phone TCPA
-- copy); user_agent complements IP for stronger evidence of who requested
-- the call. Email events may leave consent_version null.

ALTER TABLE "public"."claim_consent_events"
  ADD COLUMN IF NOT EXISTS "consent_version" "text";

ALTER TABLE "public"."claim_consent_events"
  ADD COLUMN IF NOT EXISTS "user_agent" "text";

-- Existing rows (if any) predate versioned copy.
UPDATE "public"."claim_consent_events"
SET "consent_version" = 'phone_claim_v1'
WHERE "consent_version" IS NULL
  AND "channel" = 'phone';

-- Consent logs must not be readable or writable from the browser.
REVOKE ALL ON TABLE "public"."claim_consent_events" FROM "anon";
REVOKE ALL ON TABLE "public"."claim_consent_events" FROM "authenticated";
GRANT ALL ON TABLE "public"."claim_consent_events" TO "service_role";
GRANT ALL ON TABLE "public"."claim_consent_events" TO "postgres";

-- Keep RLS on; with no policies for anon/authenticated, client roles are denied.
-- service_role bypasses RLS in Supabase.
ALTER TABLE "public"."claim_consent_events" ENABLE ROW LEVEL SECURITY;
