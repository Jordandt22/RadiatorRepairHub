ALTER TABLE "public"."listing_requests"
  ADD COLUMN IF NOT EXISTS "place_id" "text";

CREATE INDEX IF NOT EXISTS "idx_listing_requests_place_id_pending"
  ON "public"."listing_requests" USING "btree" ("place_id")
  WHERE ("status" = 'pending' AND "place_id" IS NOT NULL);
