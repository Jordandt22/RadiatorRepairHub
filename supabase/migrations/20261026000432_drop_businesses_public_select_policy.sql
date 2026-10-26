-- Permissive policies are combined with OR. The live "Public" SELECT
-- policy (USING true) would keep hidden businesses readable.
DROP POLICY IF EXISTS "Public" ON public.businesses;
