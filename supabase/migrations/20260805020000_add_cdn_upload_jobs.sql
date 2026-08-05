-- CDN photo upload job runs (manual backfill via BullMQ)

CREATE TABLE IF NOT EXISTS "public"."cdn_upload_jobs" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "limit_count" integer DEFAULT 100 NOT NULL,
  "selected_count" integer DEFAULT 0 NOT NULL,
  "succeeded_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "skipped_count" integer DEFAULT 0 NOT NULL,
  "result_payload" "jsonb",
  "failed_data" "jsonb",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  CONSTRAINT "cdn_upload_jobs_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'running'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  ),
  CONSTRAINT "cdn_upload_jobs_limit_count_check" CHECK ("limit_count" > 0)
);

ALTER TABLE "public"."cdn_upload_jobs" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cdn_upload_jobs_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."cdn_upload_jobs"
      ADD CONSTRAINT "cdn_upload_jobs_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_cdn_upload_jobs_created_at"
  ON "public"."cdn_upload_jobs" USING "btree" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_cdn_upload_jobs_status"
  ON "public"."cdn_upload_jobs" USING "btree" ("status");

ALTER TABLE "public"."cdn_upload_jobs" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."cdn_upload_jobs" TO "service_role";
