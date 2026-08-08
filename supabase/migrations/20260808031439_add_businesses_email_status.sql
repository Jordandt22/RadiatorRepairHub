-- Manual review status for listing contacts (Email Cleaner)
DO $$ BEGIN
  CREATE TYPE "public"."business_email_status" AS ENUM (
    'suspicious',
    'checked',
    'unable_to_find',
    'not_checked'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."businesses"
  ADD COLUMN IF NOT EXISTS "email_status" "public"."business_email_status"
    DEFAULT 'not_checked'::"public"."business_email_status" NOT NULL;

ALTER TABLE "public"."businesses"
  ADD COLUMN IF NOT EXISTS "email_status_marked_at" timestamp with time zone;

CREATE INDEX IF NOT EXISTS "idx_businesses_email_status"
  ON "public"."businesses" USING "btree" ("email_status");
