-- Partner website intake media (logo + gallery) as first-class rows,
-- plus photo usage/storage consent on the intake.

ALTER TABLE public.partner_website_intakes
  ADD COLUMN IF NOT EXISTS media_usage_consented_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS media_usage_consent_version text;

CREATE TABLE IF NOT EXISTS public.partner_website_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('logo', 'gallery')),
  image_id uuid NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  original_filename text,
  content_type text NOT NULL,
  byte_size integer NOT NULL CHECK (byte_size > 0),
  width integer,
  height integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partner_website_media_business_image_unique UNIQUE (business_id, image_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS partner_website_media_one_logo_per_business
  ON public.partner_website_media (business_id)
  WHERE kind = 'logo';

CREATE INDEX IF NOT EXISTS partner_website_media_business_kind_sort_idx
  ON public.partner_website_media (business_id, kind, sort_order, created_at);

ALTER TABLE public.partner_website_media ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.partner_website_media FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.partner_website_media TO service_role;
GRANT ALL ON TABLE public.partner_website_media TO postgres;

-- Backfill gallery/logo refs from existing intake payloads when present.
INSERT INTO public.partner_website_media (
  business_id,
  kind,
  image_id,
  url,
  sort_order,
  content_type,
  byte_size
)
SELECT
  i.business_id,
  'logo',
  (i.payload -> 'logo' ->> 'imageId')::uuid,
  i.payload -> 'logo' ->> 'url',
  0,
  'image/jpeg',
  1
FROM public.partner_website_intakes i
WHERE i.payload -> 'logo' ->> 'imageId' ~ '^[0-9a-fA-F-]{36}$'
  AND COALESCE(i.payload -> 'logo' ->> 'url', '') <> ''
ON CONFLICT (business_id, image_id) DO NOTHING;

INSERT INTO public.partner_website_media (
  business_id,
  kind,
  image_id,
  url,
  sort_order,
  content_type,
  byte_size
)
SELECT
  i.business_id,
  'gallery',
  (img ->> 'imageId')::uuid,
  img ->> 'url',
  (ordinality - 1)::integer,
  'image/jpeg',
  1
FROM public.partner_website_intakes i
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(i.payload -> 'images') = 'array' THEN i.payload -> 'images'
    ELSE '[]'::jsonb
  END
) WITH ORDINALITY AS t(img, ordinality)
WHERE img ->> 'imageId' ~ '^[0-9a-fA-F-]{36}$'
  AND COALESCE(img ->> 'url', '') <> ''
ON CONFLICT (business_id, image_id) DO NOTHING;
