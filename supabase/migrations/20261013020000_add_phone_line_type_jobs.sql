-- Manual phone line type jobs. Each run checks a chosen number of businesses.

CREATE TABLE IF NOT EXISTS "public"."phone_line_type_jobs" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "limit_count" integer NOT NULL,
  "selected_count" integer DEFAULT 0 NOT NULL,
  "succeeded_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "skipped_count" integer DEFAULT 0 NOT NULL,
  "business_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
  "error_message" "text",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  CONSTRAINT "phone_line_type_jobs_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'running'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  ),
  CONSTRAINT "phone_line_type_jobs_limit_count_check" CHECK ("limit_count" > 0)
);

ALTER TABLE "public"."phone_line_type_jobs" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'phone_line_type_jobs_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."phone_line_type_jobs"
      ADD CONSTRAINT "phone_line_type_jobs_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_phone_line_type_jobs_created_at"
  ON "public"."phone_line_type_jobs" USING "btree" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_phone_line_type_jobs_status"
  ON "public"."phone_line_type_jobs" USING "btree" ("status");

ALTER TABLE "public"."phone_line_type_jobs" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."phone_line_type_jobs" TO "service_role";
