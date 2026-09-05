-- Phone claim verification: add a channel to claim requests (email code vs
-- automated verification call) plus an audit trail of consent for each
-- outbound verification (start and resend).

DO $$ BEGIN
  CREATE TYPE "public"."claim_request_channels" AS ENUM (
    'email',
    'phone'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."claim_consent_actions" AS ENUM (
    'start',
    'resend'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."claim_requests"
  ADD COLUMN IF NOT EXISTS "channel" "public"."claim_request_channels"
    DEFAULT 'email'::"public"."claim_request_channels" NOT NULL;

ALTER TABLE "public"."claim_requests"
  ADD COLUMN IF NOT EXISTS "resend_count" integer DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_claim_requests_business_channel_created_at"
  ON "public"."claim_requests" USING "btree" ("business_id", "channel", "created_at" DESC);

-- Consent records outlive the claim request they belong to: they are the audit
-- trail for each outbound call, and the phone rate limit counts them so
-- canceling a claim cannot reset the daily budget.
CREATE TABLE IF NOT EXISTS "public"."claim_consent_events" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "claim_request_id" "uuid",
  "business_id" "uuid" NOT NULL,
  "channel" "public"."claim_request_channels" NOT NULL,
  "action" "public"."claim_consent_actions" NOT NULL,
  "destination" "text" NOT NULL,
  "ip" "text",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."claim_consent_events" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'claim_consent_events_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."claim_consent_events"
      ADD CONSTRAINT "claim_consent_events_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'claim_consent_events_claim_request_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."claim_consent_events"
      ADD CONSTRAINT "claim_consent_events_claim_request_id_fkey"
      FOREIGN KEY ("claim_request_id")
      REFERENCES "public"."claim_requests"("claim_request_id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'claim_consent_events_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."claim_consent_events"
      ADD CONSTRAINT "claim_consent_events_business_id_fkey"
      FOREIGN KEY ("business_id")
      REFERENCES "public"."businesses"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Rate limit lookup: phone claim starts per business in the last 24 hours.
CREATE INDEX IF NOT EXISTS "idx_claim_consent_events_business_channel_action_created_at"
  ON "public"."claim_consent_events" USING "btree" (
    "business_id", "channel", "action", "created_at" DESC
  );

CREATE INDEX IF NOT EXISTS "idx_claim_consent_events_claim_request_id"
  ON "public"."claim_consent_events" USING "btree" ("claim_request_id");

ALTER TABLE "public"."claim_consent_events" ENABLE ROW LEVEL SECURITY;

-- Consent logs are written only by the API (service_role). Do not expose to
-- browser roles; a later migration also revokes these if an older copy ran.
REVOKE ALL ON TABLE "public"."claim_consent_events" FROM "anon";
REVOKE ALL ON TABLE "public"."claim_consent_events" FROM "authenticated";
GRANT ALL ON TABLE "public"."claim_consent_events" TO "service_role";
GRANT ALL ON TABLE "public"."claim_consent_events" TO "postgres";
