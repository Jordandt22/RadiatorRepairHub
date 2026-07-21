


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";




SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."business_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "mechanic" boolean DEFAULT false NOT NULL,
    "restroom" boolean DEFAULT false NOT NULL,
    "credit_cards" boolean DEFAULT false NOT NULL,
    "debit_cards" boolean DEFAULT false NOT NULL,
    "wheelchair_accessible" boolean DEFAULT false NOT NULL,
    "onsite_services" boolean DEFAULT false NOT NULL,
    "oil_change" boolean DEFAULT false NOT NULL,
    "nfc_mobile_payments" boolean DEFAULT false NOT NULL,
    "appointments_recommended" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."business_features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "day_of_week" "text" NOT NULL,
    "hours" "jsonb" NOT NULL,
    "is_closed" boolean DEFAULT false NOT NULL,
    "hours_text" "text" NOT NULL
);


ALTER TABLE "public"."business_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_secondary_categories" (
    "business_id" "uuid" NOT NULL,
    "secondary_category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."business_secondary_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "primary_category_id" "uuid" NOT NULL,
    "address" "text" NOT NULL,
    "neighborhood" "text",
    "street" "text",
    "city_id" "uuid" NOT NULL,
    "postal_code_id" "uuid",
    "state_id" "uuid" NOT NULL,
    "country_code" "text" NOT NULL,
    "website" "text",
    "phone" "text" NOT NULL,
    "total_score" double precision NOT NULL,
    "place_id" "text",
    "fid" "text",
    "cid" "text",
    "reviews_count" integer NOT NULL,
    "url" "text",
    "rank" integer,
    "image_url" "text",
    "kgmid" "text",
    "reviews_distribution" "jsonb",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "description" "text" NOT NULL,
    "highlights" "jsonb" NOT NULL,
    "title_tag" "text" NOT NULL,
    "meta_description" "text" NOT NULL,
    "local_note" "text" NOT NULL,
    "keywords" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug" "text" NOT NULL,
    "opening_hours_confirmation" "text" DEFAULT 'Last Updated Unknown'::"text" NOT NULL,
    "booking_links" "jsonb",
    "owner_updates" "jsonb",
    "cta_line" "text",
    "scraped_at" timestamp with time zone,
    "image_urls" "jsonb",
    "plus_code" "text",
    "timezone" "text" NOT NULL,
    "email" "text"
);


ALTER TABLE "public"."businesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "state_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."postal_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "city_id" "uuid" NOT NULL
);


ALTER TABLE "public"."postal_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."primary_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."primary_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."secondary_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."secondary_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "country_code" "text" DEFAULT 'US'::"text" NOT NULL
);


ALTER TABLE "public"."states" OWNER TO "postgres";


ALTER TABLE ONLY "public"."business_features"
    ADD CONSTRAINT "business_features_business_id_key" UNIQUE ("business_id");



ALTER TABLE ONLY "public"."business_features"
    ADD CONSTRAINT "business_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_secondary_categories"
    ADD CONSTRAINT "business_secondary_categories_pkey" PRIMARY KEY ("business_id", "secondary_category_id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_place_id_key" UNIQUE ("place_id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_state_id_name_unique" UNIQUE ("state_id", "name");



ALTER TABLE ONLY "public"."postal_codes"
    ADD CONSTRAINT "postal_codes_code_city_id_key" UNIQUE ("code", "city_id");



ALTER TABLE ONLY "public"."postal_codes"
    ADD CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."primary_categories"
    ADD CONSTRAINT "primary_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."primary_categories"
    ADD CONSTRAINT "primary_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."primary_categories"
    ADD CONSTRAINT "primary_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."secondary_categories"
    ADD CONSTRAINT "secondary_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."secondary_categories"
    ADD CONSTRAINT "secondary_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."secondary_categories"
    ADD CONSTRAINT "secondary_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bsc_secondary_category_id" ON "public"."business_secondary_categories" USING "btree" ("secondary_category_id");



CREATE INDEX "idx_business_hours_business_id" ON "public"."business_hours" USING "btree" ("business_id");



CREATE INDEX "idx_businesses_category_reviews_score" ON "public"."businesses" USING "btree" ("primary_category_id", "reviews_count" DESC, "total_score" DESC);



CREATE INDEX "idx_businesses_city_state_reviews_score" ON "public"."businesses" USING "btree" ("city_id", "state_id", "reviews_count" DESC, "total_score" DESC);



CREATE INDEX "idx_businesses_featured" ON "public"."businesses" USING "btree" ("total_score" DESC) WHERE ("reviews_count" >= 400);



CREATE INDEX "idx_businesses_state_reviews_score" ON "public"."businesses" USING "btree" ("state_id", "reviews_count" DESC, "total_score" DESC);



CREATE UNIQUE INDEX "idx_cities_state_slug" ON "public"."cities" USING "btree" ("state_id", "slug");



CREATE INDEX "idx_postal_codes_city_id" ON "public"."postal_codes" USING "btree" ("city_id");



ALTER TABLE ONLY "public"."business_features"
    ADD CONSTRAINT "business_features_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_secondary_categories"
    ADD CONSTRAINT "business_secondary_categories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_secondary_categories"
    ADD CONSTRAINT "business_secondary_categories_secondary_category_id_fkey" FOREIGN KEY ("secondary_category_id") REFERENCES "public"."secondary_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_postal_code_id_fkey" FOREIGN KEY ("postal_code_id") REFERENCES "public"."postal_codes"("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_primary_category_id_fkey" FOREIGN KEY ("primary_category_id") REFERENCES "public"."primary_categories"("id");



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."postal_codes"
    ADD CONSTRAINT "postal_codes_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."business_secondary_categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."businesses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cities" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."postal_codes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."primary_categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."secondary_categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."states" FOR SELECT USING (true);



CREATE POLICY "Public" ON "public"."business_features" FOR SELECT USING (true);



CREATE POLICY "Public" ON "public"."business_hours" FOR SELECT USING (true);



ALTER TABLE "public"."business_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_secondary_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."businesses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."postal_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."primary_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."secondary_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."states" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."business_features" TO "anon";
GRANT ALL ON TABLE "public"."business_features" TO "authenticated";
GRANT ALL ON TABLE "public"."business_features" TO "service_role";



GRANT ALL ON TABLE "public"."business_hours" TO "anon";
GRANT ALL ON TABLE "public"."business_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."business_hours" TO "service_role";



GRANT ALL ON TABLE "public"."business_secondary_categories" TO "anon";
GRANT ALL ON TABLE "public"."business_secondary_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."business_secondary_categories" TO "service_role";



GRANT ALL ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."businesses" TO "service_role";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";



GRANT ALL ON TABLE "public"."postal_codes" TO "anon";
GRANT ALL ON TABLE "public"."postal_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."postal_codes" TO "service_role";



GRANT ALL ON TABLE "public"."primary_categories" TO "anon";
GRANT ALL ON TABLE "public"."primary_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."primary_categories" TO "service_role";



GRANT ALL ON TABLE "public"."secondary_categories" TO "anon";
GRANT ALL ON TABLE "public"."secondary_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."secondary_categories" TO "service_role";



GRANT ALL ON TABLE "public"."states" TO "anon";
GRANT ALL ON TABLE "public"."states" TO "authenticated";
GRANT ALL ON TABLE "public"."states" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
