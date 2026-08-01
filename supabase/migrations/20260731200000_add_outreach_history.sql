DO $$ BEGIN
  CREATE TYPE "public"."outreach_message_type" AS ENUM (
    'email',
    'phone'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."outreach_type" AS ENUM (
    'claim_invite',
    'website_offer'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."outreach_history" (
  "outreach_history_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "business_id" "uuid" NOT NULL,
  "message_type" "public"."outreach_message_type" DEFAULT 'email'::"public"."outreach_message_type" NOT NULL,
  "outreach_type" "public"."outreach_type" NOT NULL,
  "recipient" "text" NOT NULL,
  "subject" "text",
  "provider" "text" DEFAULT 'resend',
  "provider_message_id" "text",
  "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "sent_by" "uuid",
  "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."outreach_history" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'outreach_history_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."outreach_history"
      ADD CONSTRAINT "outreach_history_pkey" PRIMARY KEY ("outreach_history_id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'outreach_history_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."outreach_history"
      ADD CONSTRAINT "outreach_history_business_id_fkey"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'outreach_history_business_channel_type_unique'
  ) THEN
    ALTER TABLE ONLY "public"."outreach_history"
      ADD CONSTRAINT "outreach_history_business_channel_type_unique"
      UNIQUE ("business_id", "message_type", "outreach_type");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_outreach_history_type_sent_at"
  ON "public"."outreach_history" USING "btree" ("outreach_type", "sent_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_outreach_history_business_id"
  ON "public"."outreach_history" USING "btree" ("business_id");

CREATE INDEX IF NOT EXISTS "idx_outreach_history_sent_at"
  ON "public"."outreach_history" USING "btree" ("sent_at" DESC);

ALTER TABLE "public"."outreach_history" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."outreach_history" TO "anon";
GRANT ALL ON TABLE "public"."outreach_history" TO "authenticated";
GRANT ALL ON TABLE "public"."outreach_history" TO "service_role";

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
    WHEN dupes.email IS NOT NULL THEN 'duplicate_email'
    ELSE 'able'
  END AS claim_eligibility,
  ci.sent_at AS claim_invite_sent_at,
  wo.sent_at AS website_offer_sent_at
FROM "public"."businesses" b
LEFT JOIN (
  SELECT email
  FROM "public"."businesses"
  WHERE email IS NOT NULL AND length(btrim(email)) > 0
  GROUP BY email
  HAVING count(*) > 1
) dupes ON dupes.email = b.email
LEFT JOIN "public"."outreach_history" ci
  ON ci.business_id = b.id
  AND ci.message_type = 'email'::"public"."outreach_message_type"
  AND ci.outreach_type = 'claim_invite'::"public"."outreach_type"
LEFT JOIN "public"."outreach_history" wo
  ON wo.business_id = b.id
  AND wo.message_type = 'email'::"public"."outreach_message_type"
  AND wo.outreach_type = 'website_offer'::"public"."outreach_type";

ALTER VIEW "public"."outreach_business_list" OWNER TO "postgres";

GRANT SELECT ON TABLE "public"."outreach_business_list" TO "anon";
GRANT SELECT ON TABLE "public"."outreach_business_list" TO "authenticated";
GRANT SELECT ON TABLE "public"."outreach_business_list" TO "service_role";
