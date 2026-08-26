-- Flag rows created from the internal Testing page so they can be listed
-- and hard-deleted without treating them as production fixtures.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_businesses_is_test
  ON public.businesses (created_at DESC)
  WHERE is_test = true;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_is_test
  ON public.users (created_at DESC)
  WHERE is_test = true;
