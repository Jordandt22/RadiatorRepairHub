-- Ingest pipeline: groups (upload) → batches → jobs (filter / enrich / insert)

CREATE TABLE IF NOT EXISTS "public"."ingest_groups" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "name" "text" NOT NULL,
  "payload" "jsonb" NOT NULL,
  "filtered_out_payload" "jsonb",
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  CONSTRAINT "ingest_groups_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'filtering'::"text",
        'processing'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  )
);

ALTER TABLE "public"."ingest_groups" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_groups_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_groups"
      ADD CONSTRAINT "ingest_groups_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ingest_jobs" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "group_id" "uuid" NOT NULL,
  "batch_id" "uuid",
  "job_type" "text" NOT NULL,
  "status" "text" DEFAULT 'running'::"text" NOT NULL,
  "failed_data" "jsonb",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "completed_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  CONSTRAINT "ingest_jobs_job_type_check" CHECK (
    "job_type" = ANY (
      ARRAY['filter'::"text", 'enrich'::"text", 'insert'::"text"]
    )
  ),
  CONSTRAINT "ingest_jobs_status_check" CHECK (
    "status" = ANY (
      ARRAY['running'::"text", 'completed'::"text", 'failed'::"text"]
    )
  )
);

ALTER TABLE "public"."ingest_jobs" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_jobs_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_jobs"
      ADD CONSTRAINT "ingest_jobs_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ingest_batches" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "group_id" "uuid" NOT NULL,
  "initial_payload" "jsonb" NOT NULL,
  "result_payload" "jsonb",
  "failed_enrichment_payload" "jsonb",
  "failed_insertion_payload" "jsonb",
  "current_job_id" "uuid",
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  CONSTRAINT "ingest_batches_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'enriching'::"text",
        'inserting'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  )
);

ALTER TABLE "public"."ingest_batches" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_batches_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_batches"
      ADD CONSTRAINT "ingest_batches_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_jobs_group_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_jobs"
      ADD CONSTRAINT "ingest_jobs_group_id_fkey"
      FOREIGN KEY ("group_id") REFERENCES "public"."ingest_groups"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_batches_group_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_batches"
      ADD CONSTRAINT "ingest_batches_group_id_fkey"
      FOREIGN KEY ("group_id") REFERENCES "public"."ingest_groups"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_jobs_batch_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_jobs"
      ADD CONSTRAINT "ingest_jobs_batch_id_fkey"
      FOREIGN KEY ("batch_id") REFERENCES "public"."ingest_batches"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ingest_batches_current_job_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."ingest_batches"
      ADD CONSTRAINT "ingest_batches_current_job_id_fkey"
      FOREIGN KEY ("current_job_id") REFERENCES "public"."ingest_jobs"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_ingest_batches_group_id"
  ON "public"."ingest_batches" USING "btree" ("group_id");

CREATE INDEX IF NOT EXISTS "idx_ingest_jobs_group_id"
  ON "public"."ingest_jobs" USING "btree" ("group_id");

CREATE INDEX IF NOT EXISTS "idx_ingest_jobs_batch_id"
  ON "public"."ingest_jobs" USING "btree" ("batch_id");

CREATE INDEX IF NOT EXISTS "idx_ingest_groups_created_at"
  ON "public"."ingest_groups" USING "btree" ("created_at" DESC);

ALTER TABLE "public"."ingest_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ingest_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ingest_jobs" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."ingest_groups" TO "service_role";
GRANT ALL ON TABLE "public"."ingest_batches" TO "service_role";
GRANT ALL ON TABLE "public"."ingest_jobs" TO "service_role";

-- Claim a batch for a job (atomic). Sets current_job_id and batch status.
CREATE OR REPLACE FUNCTION "public"."ingest_claim_batch_job"(
  "p_batch_id" "uuid",
  "p_job_id" "uuid",
  "p_batch_status" "text"
)
RETURNS "public"."ingest_batches"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  "v_batch" "public"."ingest_batches";
BEGIN
  UPDATE "public"."ingest_batches"
  SET
    "current_job_id" = "p_job_id",
    "status" = "p_batch_status",
    "updated_at" = "now"()
  WHERE "id" = "p_batch_id"
    AND ("current_job_id" IS NULL OR "current_job_id" = "p_job_id")
  RETURNING * INTO "v_batch";

  IF "v_batch" IS NULL THEN
    RAISE EXCEPTION 'ingest_claim_batch_job failed: batch % busy or missing', "p_batch_id";
  END IF;

  RETURN "v_batch";
END;
$$;

-- Finish a batch job: clear current_job_id, patch payloads/status, complete/fail job row.
CREATE OR REPLACE FUNCTION "public"."ingest_finish_batch_job"(
  "p_batch_id" "uuid",
  "p_job_id" "uuid",
  "p_job_status" "text",
  "p_batch_status" "text",
  "p_result_payload" "jsonb" DEFAULT NULL,
  "p_failed_enrichment_payload" "jsonb" DEFAULT NULL,
  "p_failed_insertion_payload" "jsonb" DEFAULT NULL,
  "p_failed_data" "jsonb" DEFAULT NULL,
  "p_update_result_payload" boolean DEFAULT false,
  "p_update_failed_enrichment" boolean DEFAULT false,
  "p_update_failed_insertion" boolean DEFAULT false
)
RETURNS "public"."ingest_batches"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  "v_batch" "public"."ingest_batches";
BEGIN
  UPDATE "public"."ingest_batches"
  SET
    "current_job_id" = NULL,
    "status" = "p_batch_status",
    "result_payload" = CASE
      WHEN "p_update_result_payload" THEN "p_result_payload"
      ELSE "result_payload"
    END,
    "failed_enrichment_payload" = CASE
      WHEN "p_update_failed_enrichment" THEN "p_failed_enrichment_payload"
      ELSE "failed_enrichment_payload"
    END,
    "failed_insertion_payload" = CASE
      WHEN "p_update_failed_insertion" THEN "p_failed_insertion_payload"
      ELSE "failed_insertion_payload"
    END,
    "updated_at" = "now"()
  WHERE "id" = "p_batch_id"
  RETURNING * INTO "v_batch";

  IF "v_batch" IS NULL THEN
    RAISE EXCEPTION 'ingest_finish_batch_job failed: batch % missing', "p_batch_id";
  END IF;

  IF "p_job_status" = 'completed' THEN
    UPDATE "public"."ingest_jobs"
    SET
      "status" = 'completed',
      "completed_at" = "now"(),
      "failed_at" = NULL,
      "failed_data" = NULL
    WHERE "id" = "p_job_id";
  ELSIF "p_job_status" = 'failed' THEN
    UPDATE "public"."ingest_jobs"
    SET
      "status" = 'failed',
      "failed_at" = "now"(),
      "failed_data" = "p_failed_data",
      "completed_at" = NULL
    WHERE "id" = "p_job_id";
  END IF;

  RETURN "v_batch";
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."ingest_claim_batch_job"("uuid", "uuid", "text") TO "service_role";
GRANT EXECUTE ON FUNCTION "public"."ingest_finish_batch_job"("uuid", "uuid", "text", "text", "jsonb", "jsonb", "jsonb", "jsonb", boolean, boolean, boolean) TO "service_role";
