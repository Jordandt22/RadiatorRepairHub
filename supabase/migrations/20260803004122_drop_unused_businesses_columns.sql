-- Drop scrape/ingest leftover columns unused by the app.
-- Also drop opening_hours_confirmation; listing freshness uses last_edited_at.

ALTER TABLE public.businesses
  DROP COLUMN IF EXISTS neighborhood,
  DROP COLUMN IF EXISTS street,
  DROP COLUMN IF EXISTS country_code,
  DROP COLUMN IF EXISTS fid,
  DROP COLUMN IF EXISTS cid,
  DROP COLUMN IF EXISTS rank,
  DROP COLUMN IF EXISTS kgmid,
  DROP COLUMN IF EXISTS reviews_distribution,
  DROP COLUMN IF EXISTS opening_hours_confirmation,
  DROP COLUMN IF EXISTS booking_links,
  DROP COLUMN IF EXISTS owner_updates,
  DROP COLUMN IF EXISTS image_urls,
  DROP COLUMN IF EXISTS plus_code,
  DROP COLUMN IF EXISTS cta_line;
