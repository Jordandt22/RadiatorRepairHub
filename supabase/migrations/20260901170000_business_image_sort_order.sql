ALTER TABLE public.business_images
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS default_image_sort_order integer;

DO $$ BEGIN
  ALTER TABLE public.business_images
    ADD CONSTRAINT business_images_sort_order_check
    CHECK (sort_order >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

WITH ranked AS (
  SELECT
    image_id,
    row_number() OVER (
      PARTITION BY business_id
      ORDER BY created_at ASC, image_id ASC
    ) - 1 AS next_sort_order
  FROM public.business_images
)
UPDATE public.business_images bi
SET sort_order = ranked.next_sort_order
FROM ranked
WHERE bi.image_id = ranked.image_id;

UPDATE public.businesses
SET default_image_sort_order = 0
WHERE image_url IS NOT NULL
  AND default_image_sort_order IS NULL;

NOTIFY pgrst, 'reload schema';
