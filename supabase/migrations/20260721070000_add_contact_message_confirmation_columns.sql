ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS confirmation_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

NOTIFY pgrst, 'reload schema';
