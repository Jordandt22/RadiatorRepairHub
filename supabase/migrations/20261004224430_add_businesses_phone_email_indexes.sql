-- Shared phone and email checks filter businesses with equality and were
-- sequential scans. Partial indexes skip nulls, which those lookups never match.

CREATE INDEX IF NOT EXISTS "idx_businesses_phone"
  ON "public"."businesses" USING "btree" ("phone")
  WHERE "phone" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_businesses_email"
  ON "public"."businesses" USING "btree" ("email")
  WHERE "email" IS NOT NULL;
