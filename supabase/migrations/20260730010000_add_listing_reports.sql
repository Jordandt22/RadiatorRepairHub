DO $$ BEGIN
  CREATE TYPE "public"."listing_report_reasons" AS ENUM (
    'wrong_claim_contact',
    'inappropriate'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."listing_report_statuses" AS ENUM (
    'pending',
    'resolved',
    'dismissed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."listing_reports" (
  "listing_report_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "business_id" "uuid" NOT NULL,
  "reason" "public"."listing_report_reasons" NOT NULL,
  "details" "text" NOT NULL,
  "reporter_name" "text",
  "reporter_email" "text" NOT NULL,
  "suggested_phone" "text",
  "suggested_email" "text",
  "status" "public"."listing_report_statuses" DEFAULT 'pending'::"public"."listing_report_statuses" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "resolved_at" timestamp with time zone,
  "resolved_by" "text"
);

ALTER TABLE "public"."listing_reports" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listing_reports_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."listing_reports"
      ADD CONSTRAINT "listing_reports_pkey" PRIMARY KEY ("listing_report_id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listing_reports_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."listing_reports"
      ADD CONSTRAINT "listing_reports_business_id_fkey"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_listing_reports_status_created_at"
  ON "public"."listing_reports" USING "btree" ("status", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_listing_reports_business_id"
  ON "public"."listing_reports" USING "btree" ("business_id");

ALTER TABLE "public"."listing_reports" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."listing_reports" TO "anon";
GRANT ALL ON TABLE "public"."listing_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_reports" TO "service_role";
