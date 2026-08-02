DO $$ BEGIN
  CREATE TYPE "public"."affiliate_provider" AS ENUM (
    'amazon'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."affiliate_products" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "provider" "public"."affiliate_provider" DEFAULT 'amazon'::"public"."affiliate_provider" NOT NULL,
  "product_link" "text" NOT NULL,
  "affiliate_link" "text" NOT NULL,
  "title" "text" NOT NULL,
  "description" "text",
  "image_url" "text",
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."affiliate_products" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_products_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."affiliate_products"
      ADD CONSTRAINT "affiliate_products_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_affiliate_products_provider_active"
  ON "public"."affiliate_products" USING "btree" ("provider", "is_active");

CREATE INDEX IF NOT EXISTS "idx_affiliate_products_created_at"
  ON "public"."affiliate_products" USING "btree" ("created_at" DESC);

ALTER TABLE "public"."affiliate_products" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'affiliate_products'
      AND policyname = 'affiliate_products_public_read_active'
  ) THEN
    CREATE POLICY "affiliate_products_public_read_active"
      ON "public"."affiliate_products"
      FOR SELECT
      TO "anon", "authenticated"
      USING ("is_active" = true);
  END IF;
END $$;

GRANT ALL ON TABLE "public"."affiliate_products" TO "anon";
GRANT ALL ON TABLE "public"."affiliate_products" TO "authenticated";
GRANT ALL ON TABLE "public"."affiliate_products" TO "service_role";
