DO $$ BEGIN
  CREATE TYPE "public"."feedback_survey_form_types" AS ENUM (
    'quick_contact',
    'report_info',
    'contact',
    'get_listed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."feedback_survey_found_vias" AS ENUM (
    'google_search',
    'referral',
    'social_media',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."feedback_survey_found_looking_for" AS ENUM (
    'yes',
    'no',
    'partially'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."feedback_surveys" (
  "feedback_survey_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "form_type" "public"."feedback_survey_form_types" NOT NULL,
  "business_id" "uuid",
  "found_via" "public"."feedback_survey_found_vias" NOT NULL,
  "found_looking_for" "public"."feedback_survey_found_looking_for" NOT NULL,
  "comment" "text",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  CONSTRAINT "feedback_surveys_comment_length_check"
    CHECK ("comment" IS NULL OR char_length("comment") <= 500)
);

ALTER TABLE "public"."feedback_surveys" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'feedback_surveys_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."feedback_surveys"
      ADD CONSTRAINT "feedback_surveys_pkey" PRIMARY KEY ("feedback_survey_id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'feedback_surveys_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."feedback_surveys"
      ADD CONSTRAINT "feedback_surveys_business_id_fkey"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_feedback_surveys_form_type_created_at"
  ON "public"."feedback_surveys" USING "btree" ("form_type", "created_at" DESC);

ALTER TABLE "public"."feedback_surveys" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."feedback_surveys" TO "anon";
GRANT ALL ON TABLE "public"."feedback_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_surveys" TO "service_role";
