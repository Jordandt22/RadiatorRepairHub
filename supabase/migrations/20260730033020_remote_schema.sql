-- Bring prod/shadow up to the ownership + claims schema already live on RRH-Dev.
-- Written as idempotent SQL so it is safe on databases that already have parts
-- of this state (e.g. cdn_stored) and safe if re-applied via repair/replay.
--
-- IMPORTANT: constraint-name checks must be scoped to public.<table>. A bare
-- conname lookup for users_pkey matches auth.users and skips creating the PK.

DO $$ BEGIN
  CREATE TYPE public.claim_request_statuses AS ENUM (
    'pending',
    'success',
    'failed',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_roles AS ENUM ('business_owner');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Owners can update business hours" ON public.business_hours;

CREATE TABLE IF NOT EXISTS public.claim_requests (
  claim_request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  status public.claim_request_statuses NOT NULL DEFAULT 'pending'::public.claim_request_statuses,
  attempts integer NOT NULL DEFAULT 0,
  last_attempted_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  completed_by uuid,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT claim_requests_pkey PRIMARY KEY (claim_request_id)
);

ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.users (
  uid uuid NOT NULL,
  role public.user_roles NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (uid)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.businesses DROP COLUMN IF EXISTS updated_at;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS cdn_stored boolean NOT NULL DEFAULT false;

ALTER TABLE public.businesses
  ALTER COLUMN place_id SET NOT NULL;

-- If tables already existed without PKs (failed prior attempt), ensure them.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'claim_requests'
      AND c.conname = 'claim_requests_pkey'
  ) THEN
    ALTER TABLE ONLY public.claim_requests
      ADD CONSTRAINT claim_requests_pkey PRIMARY KEY (claim_request_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'users'
      AND c.conname = 'users_pkey'
  ) THEN
    ALTER TABLE ONLY public.users
      ADD CONSTRAINT users_pkey PRIMARY KEY (uid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'businesses'
      AND c.conname = 'businesses_owner_uid_fkey'
  ) THEN
    ALTER TABLE ONLY public.businesses
      ADD CONSTRAINT businesses_owner_uid_fkey
      FOREIGN KEY (owner_uid) REFERENCES public.users(uid) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'claim_requests'
      AND c.conname = 'claim_requests_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY public.claim_requests
      ADD CONSTRAINT claim_requests_business_id_fkey
      FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'claim_requests'
      AND c.conname = 'claim_requests_completed_by_fkey'
  ) THEN
    ALTER TABLE ONLY public.claim_requests
      ADD CONSTRAINT claim_requests_completed_by_fkey
      FOREIGN KEY (completed_by) REFERENCES public.users(uid) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'users'
      AND c.conname = 'users_uid_fkey'
  ) THEN
    ALTER TABLE ONLY public.users
      ADD CONSTRAINT users_uid_fkey
      FOREIGN KEY (uid) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

GRANT ALL ON TABLE public.claim_requests TO anon;
GRANT ALL ON TABLE public.claim_requests TO authenticated;
GRANT ALL ON TABLE public.claim_requests TO service_role;

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

DROP POLICY IF EXISTS "Owner Only" ON public.business_features;
CREATE POLICY "Owner Only"
  ON public.business_features
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_features.business_id
        AND b.owner_uid = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_features.business_id
        AND b.owner_uid = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner Only" ON public.business_hours;
CREATE POLICY "Owner Only"
  ON public.business_hours
  AS PERMISSIVE
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

DROP POLICY IF EXISTS "Owner Only" ON public.businesses;
CREATE POLICY "Owner Only"
  ON public.businesses
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (owner_uid = auth.uid())
  WITH CHECK (owner_uid = auth.uid());
