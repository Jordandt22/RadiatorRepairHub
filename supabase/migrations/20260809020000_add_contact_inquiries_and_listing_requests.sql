DO $$ BEGIN
  CREATE TYPE "public"."contact_inquiry_statuses" AS ENUM (
    'pending',
    'resolved',
    'dismissed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."listing_request_statuses" AS ENUM (
    'pending',
    'listed',
    'rejected',
    'duplicate'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."contact_inquiries" (
  "contact_inquiry_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "name" "text" NOT NULL,
  "email" "text" NOT NULL,
  "phone" "text",
  "subject" "text" NOT NULL,
  "message" "text" NOT NULL,
  "status" "public"."contact_inquiry_statuses" DEFAULT 'pending'::"public"."contact_inquiry_statuses" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "resolved_at" timestamp with time zone,
  "resolved_by" "text"
);

ALTER TABLE "public"."contact_inquiries" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_inquiries_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."contact_inquiries"
      ADD CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("contact_inquiry_id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_contact_inquiries_status_created_at"
  ON "public"."contact_inquiries" USING "btree" ("status", "created_at" DESC);

ALTER TABLE "public"."contact_inquiries" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."contact_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."contact_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_inquiries" TO "service_role";

CREATE TABLE IF NOT EXISTS "public"."listing_requests" (
  "listing_request_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "business_name" "text" NOT NULL,
  "email" "text" NOT NULL,
  "phone" "text",
  "message" "text" NOT NULL,
  "status" "public"."listing_request_statuses" DEFAULT 'pending'::"public"."listing_request_statuses" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "resolved_at" timestamp with time zone,
  "resolved_by" "text",
  "live_email_sent_at" timestamp with time zone
);

ALTER TABLE "public"."listing_requests" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listing_requests_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."listing_requests"
      ADD CONSTRAINT "listing_requests_pkey" PRIMARY KEY ("listing_request_id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_listing_requests_status_created_at"
  ON "public"."listing_requests" USING "btree" ("status", "created_at" DESC);

ALTER TABLE "public"."listing_requests" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."listing_requests" TO "anon";
GRANT ALL ON TABLE "public"."listing_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_requests" TO "service_role";
