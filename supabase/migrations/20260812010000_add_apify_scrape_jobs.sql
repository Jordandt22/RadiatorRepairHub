-- Apify Google Maps scrape batches: one parent job per submission, one row per city

CREATE TABLE IF NOT EXISTS "public"."apify_scrape_jobs" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "search_keyword" "text" NOT NULL,
  "max_places" integer DEFAULT 100 NOT NULL,
  "city_count" integer DEFAULT 0 NOT NULL,
  "completed_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "failed_data" "jsonb",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  CONSTRAINT "apify_scrape_jobs_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'running'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  ),
  CONSTRAINT "apify_scrape_jobs_max_places_check" CHECK (
    "max_places" >= 10 AND "max_places" <= 200
  ),
  CONSTRAINT "apify_scrape_jobs_city_count_check" CHECK ("city_count" >= 0)
);

ALTER TABLE "public"."apify_scrape_jobs" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'apify_scrape_jobs_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."apify_scrape_jobs"
      ADD CONSTRAINT "apify_scrape_jobs_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_apify_scrape_jobs_created_at"
  ON "public"."apify_scrape_jobs" USING "btree" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_apify_scrape_jobs_status"
  ON "public"."apify_scrape_jobs" USING "btree" ("status");

ALTER TABLE "public"."apify_scrape_jobs" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."apify_scrape_jobs" TO "service_role";


CREATE TABLE IF NOT EXISTS "public"."apify_scrape_cities" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "job_id" "uuid" NOT NULL,
  "sort_index" integer NOT NULL,
  "city" "text" NOT NULL,
  "state_id" "uuid" NOT NULL,
  "location_query" "text" NOT NULL,
  "status" "text" DEFAULT 'pending'::"text" NOT NULL,
  "apify_run_id" "text",
  "ingest_group_id" "uuid",
  "place_count" integer DEFAULT 0 NOT NULL,
  "error_message" "text",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "failed_at" timestamp with time zone,
  CONSTRAINT "apify_scrape_cities_status_check" CHECK (
    "status" = ANY (
      ARRAY[
        'pending'::"text",
        'running'::"text",
        'completed'::"text",
        'failed'::"text"
      ]
    )
  ),
  CONSTRAINT "apify_scrape_cities_sort_index_check" CHECK ("sort_index" >= 0)
);

ALTER TABLE "public"."apify_scrape_cities" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'apify_scrape_cities_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."apify_scrape_cities"
      ADD CONSTRAINT "apify_scrape_cities_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'apify_scrape_cities_job_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."apify_scrape_cities"
      ADD CONSTRAINT "apify_scrape_cities_job_id_fkey"
      FOREIGN KEY ("job_id") REFERENCES "public"."apify_scrape_jobs"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'apify_scrape_cities_state_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."apify_scrape_cities"
      ADD CONSTRAINT "apify_scrape_cities_state_id_fkey"
      FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE RESTRICT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'apify_scrape_cities_ingest_group_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."apify_scrape_cities"
      ADD CONSTRAINT "apify_scrape_cities_ingest_group_id_fkey"
      FOREIGN KEY ("ingest_group_id") REFERENCES "public"."ingest_groups"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_apify_scrape_cities_job_id_sort_index"
  ON "public"."apify_scrape_cities" USING "btree" ("job_id", "sort_index");

CREATE INDEX IF NOT EXISTS "idx_apify_scrape_cities_job_id"
  ON "public"."apify_scrape_cities" USING "btree" ("job_id");

CREATE INDEX IF NOT EXISTS "idx_apify_scrape_cities_status"
  ON "public"."apify_scrape_cities" USING "btree" ("status");

ALTER TABLE "public"."apify_scrape_cities" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."apify_scrape_cities" TO "service_role";
