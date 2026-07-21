DO $$ BEGIN
  CREATE TYPE "public"."contact_message_issues" AS ENUM (
    'overheating',
    'coolant_leak',
    'radiator_fan_not_working',
    'strange_noise_or_vibration',
    'low_discolored_coolant',
    'radiator_replacement_repair',
    'routine_maintenance_flush',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."contact_message_send_methods" AS ENUM (
    'auto',
    'manual'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."contact_message_statuses" AS ENUM (
    'pending',
    'sent',
    'declined',
    'no_response',
    'approved',
    'flagged',
    'responded'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "contact_message_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "vehicle" "text",
    "issue" "public"."contact_message_issues" NOT NULL,
    "urgency" integer DEFAULT 1 NOT NULL,
    "additional_details" "text",
    "status" "public"."contact_message_statuses" DEFAULT 'pending'::"public"."contact_message_statuses" NOT NULL,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "send_method" "public"."contact_message_send_methods",
    "confirmation_sent" boolean DEFAULT false NOT NULL,
    "archived" boolean DEFAULT false NOT NULL,
    "confirmation_sent_at" timestamp with time zone,
    "declined_at" timestamp with time zone,
    "responded_at" timestamp with time zone
);

ALTER TABLE "public"."contact_messages" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."contact_messages"
      ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("contact_message_id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."contact_messages"
      ADD CONSTRAINT "contact_messages_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";

GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";
