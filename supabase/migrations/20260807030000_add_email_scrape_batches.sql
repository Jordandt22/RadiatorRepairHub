-- Email scrape batches: each parent job is split into chunks of ~20 businesses

CREATE TABLE IF NOT EXISTS "public"."email_scrape_batches" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "job_id" "uuid" NOT NULL,
  "batch_index" integer NOT NULL,
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "business_ids" "jsonb" NOT NULL,
  "result_payload" "jsonb",
  "succeeded_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "skipped_count" integer DEFAULT 0 NOT NULL,
  "failed_data" "jsonb",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  CONSTRAINT "email_scrape_batches_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'running'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  ),
  CONSTRAINT "email_scrape_batches_batch_index_check" CHECK ("batch_index" >= 0)
);

ALTER TABLE "public"."email_scrape_batches" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_scrape_batches_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."email_scrape_batches"
      ADD CONSTRAINT "email_scrape_batches_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_scrape_batches_job_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."email_scrape_batches"
      ADD CONSTRAINT "email_scrape_batches_job_id_fkey"
      FOREIGN KEY ("job_id") REFERENCES "public"."email_scrape_jobs"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_scrape_batches_job_id_batch_index"
  ON "public"."email_scrape_batches" USING "btree" ("job_id", "batch_index");

CREATE INDEX IF NOT EXISTS "idx_email_scrape_batches_job_id"
  ON "public"."email_scrape_batches" USING "btree" ("job_id");

CREATE INDEX IF NOT EXISTS "idx_email_scrape_batches_status"
  ON "public"."email_scrape_batches" USING "btree" ("status");

ALTER TABLE "public"."email_scrape_batches" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."email_scrape_batches" TO "service_role";
