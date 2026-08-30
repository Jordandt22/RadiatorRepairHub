ALTER TABLE "public"."business_images"
  ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT false NOT NULL;

ALTER TABLE "public"."businesses"
  ADD COLUMN IF NOT EXISTS "hide_default_image" boolean DEFAULT false NOT NULL;
