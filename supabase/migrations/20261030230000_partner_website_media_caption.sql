-- Optional short captions for partner website gallery photos.

ALTER TABLE public.partner_website_media
  ADD COLUMN IF NOT EXISTS caption text;

ALTER TABLE public.partner_website_media
  DROP CONSTRAINT IF EXISTS partner_website_media_caption_length;

ALTER TABLE public.partner_website_media
  ADD CONSTRAINT partner_website_media_caption_length
  CHECK (caption IS NULL OR char_length(caption) <= 120);
