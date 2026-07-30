-- Owners need INSERT/DELETE on junction rows (sync replaces associations).
-- Existing "Owner Only" policy was UPDATE-only, so deletes were no-ops under RLS.

DROP POLICY IF EXISTS "Owner Only" ON public.business_secondary_categories;

CREATE POLICY "Owners can insert secondary categories"
  ON public.business_secondary_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.business_profiles bp
      WHERE bp.business_id = business_secondary_categories.business_id
        AND bp.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Owners can delete secondary categories"
  ON public.business_secondary_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.business_profiles bp
      WHERE bp.business_id = business_secondary_categories.business_id
        AND bp.owner_uid = auth.uid()
    )
  );
