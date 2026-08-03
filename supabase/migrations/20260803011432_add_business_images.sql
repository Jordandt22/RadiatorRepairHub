CREATE TABLE IF NOT EXISTS "public"."business_images" (
  "image_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "business_id" "uuid" NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."business_images" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_images_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."business_images"
      ADD CONSTRAINT "business_images_pkey" PRIMARY KEY ("image_id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_images_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."business_images"
      ADD CONSTRAINT "business_images_business_id_fkey"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_business_images_business_id"
  ON "public"."business_images" USING "btree" ("business_id");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_business_images_one_primary_per_business"
  ON "public"."business_images" ("business_id")
  WHERE "is_primary" = true;

ALTER TABLE "public"."business_images" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'business_images'
      AND policyname = 'business_images_public_read'
  ) THEN
    CREATE POLICY "business_images_public_read"
      ON "public"."business_images"
      FOR SELECT
      TO "anon", "authenticated"
      USING (true);
  END IF;
END $$;

GRANT ALL ON TABLE "public"."business_images" TO "anon";
GRANT ALL ON TABLE "public"."business_images" TO "authenticated";
GRANT ALL ON TABLE "public"."business_images" TO "service_role";
