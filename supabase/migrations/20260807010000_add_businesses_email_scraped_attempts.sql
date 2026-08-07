-- Track email scrape attempts so retries prioritize never-tried / fewer-tried businesses

ALTER TABLE "public"."businesses"
  ADD COLUMN IF NOT EXISTS "email_scraped_attempts" integer DEFAULT 0 NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'businesses_email_scraped_attempts_check'
  ) THEN
    ALTER TABLE "public"."businesses"
      ADD CONSTRAINT "businesses_email_scraped_attempts_check"
      CHECK ("email_scraped_attempts" >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_businesses_email_scrape_pending_attempts"
  ON "public"."businesses" USING "btree" ("email_scraped_attempts", "created_at")
  WHERE "website" IS NOT NULL
    AND "website" <> ''
    AND ("email" IS NULL OR "email" = '');
