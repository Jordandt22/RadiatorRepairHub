-- Quick Contact modes: Need Service vs Questions
DO $$ BEGIN
  CREATE TYPE "public"."contact_message_types" AS ENUM (
    'need_service',
    'questions'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."contact_messages"
  ADD COLUMN IF NOT EXISTS "contact_type" "public"."contact_message_types"
  DEFAULT 'need_service'::"public"."contact_message_types" NOT NULL;

ALTER TABLE "public"."contact_messages"
  ALTER COLUMN "issue" DROP NOT NULL;

ALTER TABLE "public"."contact_messages"
  ALTER COLUMN "urgency" DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_contact_type_fields_check'
  ) THEN
    ALTER TABLE ONLY "public"."contact_messages"
      ADD CONSTRAINT "contact_messages_contact_type_fields_check"
      CHECK (
        (
          "contact_type" = 'need_service'::"public"."contact_message_types"
          AND "issue" IS NOT NULL
          AND "urgency" IS NOT NULL
        )
        OR (
          "contact_type" = 'questions'::"public"."contact_message_types"
          AND "additional_details" IS NOT NULL
          AND length(btrim("additional_details")) > 0
          AND "issue" IS NULL
          AND "urgency" IS NULL
        )
      );
  END IF;
END $$;
