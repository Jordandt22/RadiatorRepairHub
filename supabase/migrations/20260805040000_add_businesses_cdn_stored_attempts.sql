-- Track CDN upload attempts so retries prioritize never-tried / fewer-tried businesses

ALTER TABLE "public"."businesses"
  ADD COLUMN IF NOT EXISTS "cdn_stored_attempts" integer DEFAULT 0 NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'businesses_cdn_stored_attempts_check'
  ) THEN
    ALTER TABLE "public"."businesses"
      ADD CONSTRAINT "businesses_cdn_stored_attempts_check"
      CHECK ("cdn_stored_attempts" >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_businesses_cdn_pending_attempts"
  ON "public"."businesses" USING "btree" ("cdn_stored_attempts", "created_at")
  WHERE "cdn_stored" = false AND "place_id" IS NOT NULL;
