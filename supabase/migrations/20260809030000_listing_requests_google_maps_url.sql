ALTER TABLE "public"."listing_requests"
  ADD COLUMN IF NOT EXISTS "google_maps_url" "text";

UPDATE "public"."listing_requests"
SET "google_maps_url" = 'https://maps.google.com/'
WHERE "google_maps_url" IS NULL;

ALTER TABLE "public"."listing_requests"
  ALTER COLUMN "google_maps_url" SET NOT NULL;

ALTER TABLE "public"."listing_requests"
  ALTER COLUMN "message" DROP NOT NULL;
