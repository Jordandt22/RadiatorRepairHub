-- Owners can update their business_hours rows (edit hours dialog).
-- Later remote_schema migration renames this to "Owner Only".
DROP POLICY IF EXISTS "Owners can update business hours" ON public.business_hours;

CREATE POLICY "Owners can update business hours"
  ON public.business_hours
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_hours.business_id
        AND b.owner_uid = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_hours.business_id
        AND b.owner_uid = auth.uid()
    )
  );
