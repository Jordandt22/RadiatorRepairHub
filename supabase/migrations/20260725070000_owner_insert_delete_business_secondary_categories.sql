-- Owners need INSERT/DELETE on junction rows (sync replaces associations).
-- Existing "Owner Only" policy was UPDATE-only, so deletes were no-ops under RLS.
-- Ownership is on businesses.owner_uid (business_profiles was never in baseline).

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS owner_uid uuid,
  ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS last_edited_at timestamp with time zone;

DROP POLICY IF EXISTS "Owner Only" ON public.business_secondary_categories;
DROP POLICY IF EXISTS "Owners can insert secondary categories" ON public.business_secondary_categories;
DROP POLICY IF EXISTS "Owners can delete secondary categories" ON public.business_secondary_categories;

CREATE POLICY "Owners can insert secondary categories"
  ON public.business_secondary_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_secondary_categories.business_id
        AND b.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Owners can delete secondary categories"
  ON public.business_secondary_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_secondary_categories.business_id
        AND b.owner_uid = auth.uid()
    )
  );
