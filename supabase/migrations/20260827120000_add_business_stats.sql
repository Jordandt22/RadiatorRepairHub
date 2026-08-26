CREATE TABLE IF NOT EXISTS "public"."business_stats" (
  "business_id" "uuid" NOT NULL,
  "stat_date" "date" NOT NULL,
  "page_views" integer NOT NULL DEFAULT 0,
  "listing_clicks" integer NOT NULL DEFAULT 0,
  "impressions_search" integer NOT NULL DEFAULT 0,
  "search_position_sum" integer NOT NULL DEFAULT 0,
  "impressions_featured" integer NOT NULL DEFAULT 0,
  "featured_position_sum" integer NOT NULL DEFAULT 0,
  "impressions_top_verified" integer NOT NULL DEFAULT 0,
  "top_verified_position_sum" integer NOT NULL DEFAULT 0,
  "impressions_state" integer NOT NULL DEFAULT 0,
  "state_position_sum" integer NOT NULL DEFAULT 0,
  "impressions_city" integer NOT NULL DEFAULT 0,
  "city_position_sum" integer NOT NULL DEFAULT 0,
  "impressions_category" integer NOT NULL DEFAULT 0,
  "category_position_sum" integer NOT NULL DEFAULT 0,
  "phone_clicks" integer NOT NULL DEFAULT 0,
  "directions_clicks" integer NOT NULL DEFAULT 0,
  "website_clicks" integer NOT NULL DEFAULT 0,
  "email_clicks" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  CONSTRAINT "business_stats_page_views_check" CHECK ("page_views" >= 0),
  CONSTRAINT "business_stats_listing_clicks_check" CHECK ("listing_clicks" >= 0),
  CONSTRAINT "business_stats_impressions_search_check" CHECK ("impressions_search" >= 0),
  CONSTRAINT "business_stats_search_position_sum_check" CHECK ("search_position_sum" >= 0),
  CONSTRAINT "business_stats_impressions_featured_check" CHECK ("impressions_featured" >= 0),
  CONSTRAINT "business_stats_featured_position_sum_check" CHECK ("featured_position_sum" >= 0),
  CONSTRAINT "business_stats_impressions_top_verified_check" CHECK ("impressions_top_verified" >= 0),
  CONSTRAINT "business_stats_top_verified_position_sum_check" CHECK ("top_verified_position_sum" >= 0),
  CONSTRAINT "business_stats_impressions_state_check" CHECK ("impressions_state" >= 0),
  CONSTRAINT "business_stats_state_position_sum_check" CHECK ("state_position_sum" >= 0),
  CONSTRAINT "business_stats_impressions_city_check" CHECK ("impressions_city" >= 0),
  CONSTRAINT "business_stats_city_position_sum_check" CHECK ("city_position_sum" >= 0),
  CONSTRAINT "business_stats_impressions_category_check" CHECK ("impressions_category" >= 0),
  CONSTRAINT "business_stats_category_position_sum_check" CHECK ("category_position_sum" >= 0),
  CONSTRAINT "business_stats_phone_clicks_check" CHECK ("phone_clicks" >= 0),
  CONSTRAINT "business_stats_directions_clicks_check" CHECK ("directions_clicks" >= 0),
  CONSTRAINT "business_stats_website_clicks_check" CHECK ("website_clicks" >= 0),
  CONSTRAINT "business_stats_email_clicks_check" CHECK ("email_clicks" >= 0)
);

ALTER TABLE "public"."business_stats" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_stats_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."business_stats"
      ADD CONSTRAINT "business_stats_pkey" PRIMARY KEY ("business_id", "stat_date");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_stats_business_id_fkey'
  ) THEN
    ALTER TABLE ONLY "public"."business_stats"
      ADD CONSTRAINT "business_stats_business_id_fkey"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_business_stats_business_id_stat_date"
  ON "public"."business_stats" USING "btree" ("business_id", "stat_date" DESC);

ALTER TABLE "public"."business_stats" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."business_stats" TO "anon";
GRANT ALL ON TABLE "public"."business_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."business_stats" TO "service_role";

DO $$ BEGIN
  CREATE POLICY "Owners can read business stats"
    ON "public"."business_stats"
    FOR SELECT
    TO "authenticated"
    USING (
      EXISTS (
        SELECT 1
        FROM "public"."businesses" "b"
        WHERE "b"."id" = "business_stats"."business_id"
          AND "b"."owner_uid" = "auth"."uid"()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION "public"."increment_business_stat"(
  "p_business_id" "uuid",
  "p_stat_date" "date",
  "p_event" "text",
  "p_source" "text" DEFAULT NULL,
  "p_position" integer DEFAULT NULL
)
RETURNS "void"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO "public"
AS $$
DECLARE
  v_is_test boolean;
BEGIN
  IF p_business_id IS NULL OR p_stat_date IS NULL OR p_event IS NULL THEN
    RAISE EXCEPTION 'business_id, stat_date, and event are required';
  END IF;

  SELECT b.is_test INTO v_is_test
  FROM public.businesses b
  WHERE b.id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'business not found';
  END IF;

  IF COALESCE(v_is_test, false) THEN
    RETURN;
  END IF;

  INSERT INTO public.business_stats (business_id, stat_date)
  VALUES (p_business_id, p_stat_date)
  ON CONFLICT (business_id, stat_date) DO NOTHING;

  IF p_event = 'page_view' THEN
    UPDATE public.business_stats
    SET page_views = page_views + 1, updated_at = now()
    WHERE business_id = p_business_id AND stat_date = p_stat_date;
    RETURN;
  END IF;

  IF p_event = 'listing_click' THEN
    UPDATE public.business_stats
    SET listing_clicks = listing_clicks + 1, updated_at = now()
    WHERE business_id = p_business_id AND stat_date = p_stat_date;
    RETURN;
  END IF;

  IF p_event = 'phone_click' THEN
    UPDATE public.business_stats
    SET phone_clicks = phone_clicks + 1, updated_at = now()
    WHERE business_id = p_business_id AND stat_date = p_stat_date;
    RETURN;
  END IF;

  IF p_event = 'directions_click' THEN
    UPDATE public.business_stats
    SET directions_clicks = directions_clicks + 1, updated_at = now()
    WHERE business_id = p_business_id AND stat_date = p_stat_date;
    RETURN;
  END IF;

  IF p_event = 'website_click' THEN
    UPDATE public.business_stats
    SET website_clicks = website_clicks + 1, updated_at = now()
    WHERE business_id = p_business_id AND stat_date = p_stat_date;
    RETURN;
  END IF;

  IF p_event = 'email_click' THEN
    UPDATE public.business_stats
    SET email_clicks = email_clicks + 1, updated_at = now()
    WHERE business_id = p_business_id AND stat_date = p_stat_date;
    RETURN;
  END IF;

  IF p_event = 'impression' THEN
    IF p_source IS NULL OR p_position IS NULL OR p_position < 1 THEN
      RAISE EXCEPTION 'impression requires source and a positive position';
    END IF;

    IF p_source = 'search' THEN
      UPDATE public.business_stats
      SET impressions_search = impressions_search + 1,
          search_position_sum = search_position_sum + p_position,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'featured' THEN
      UPDATE public.business_stats
      SET impressions_featured = impressions_featured + 1,
          featured_position_sum = featured_position_sum + p_position,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'top_verified' THEN
      UPDATE public.business_stats
      SET impressions_top_verified = impressions_top_verified + 1,
          top_verified_position_sum = top_verified_position_sum + p_position,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'state' THEN
      UPDATE public.business_stats
      SET impressions_state = impressions_state + 1,
          state_position_sum = state_position_sum + p_position,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'city' THEN
      UPDATE public.business_stats
      SET impressions_city = impressions_city + 1,
          city_position_sum = city_position_sum + p_position,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'category' THEN
      UPDATE public.business_stats
      SET impressions_category = impressions_category + 1,
          category_position_sum = category_position_sum + p_position,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSE
      RAISE EXCEPTION 'invalid impression source: %', p_source;
    END IF;
    RETURN;
  END IF;

  RAISE EXCEPTION 'invalid business stat event: %', p_event;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_business_stat(uuid, date, text, text, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_business_stat(uuid, date, text, text, integer)
  TO service_role;
