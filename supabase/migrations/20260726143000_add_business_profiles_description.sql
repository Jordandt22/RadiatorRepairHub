-- Owner-edited about text lives on the profile so scraped business.description stays intact.
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS description text;
