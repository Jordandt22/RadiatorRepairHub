ALTER TABLE public.business_stats
  ADD COLUMN IF NOT EXISTS listing_clicks_search integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_clicks_featured integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_clicks_top_verified integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_clicks_state integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_clicks_city integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_clicks_category integer NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE public.business_stats
    ADD CONSTRAINT business_stats_listing_clicks_search_check
    CHECK (listing_clicks_search >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.business_stats
    ADD CONSTRAINT business_stats_listing_clicks_featured_check
    CHECK (listing_clicks_featured >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.business_stats
    ADD CONSTRAINT business_stats_listing_clicks_top_verified_check
    CHECK (listing_clicks_top_verified >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.business_stats
    ADD CONSTRAINT business_stats_listing_clicks_state_check
    CHECK (listing_clicks_state >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.business_stats
    ADD CONSTRAINT business_stats_listing_clicks_city_check
    CHECK (listing_clicks_city >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.business_stats
    ADD CONSTRAINT business_stats_listing_clicks_category_check
    CHECK (listing_clicks_category >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.increment_business_stat(
  p_business_id uuid,
  p_stat_date date,
  p_event text,
  p_source text DEFAULT NULL,
  p_position integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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
    IF p_source IS NULL THEN
      RAISE EXCEPTION 'listing_click requires source';
    END IF;

    IF p_source = 'search' THEN
      UPDATE public.business_stats
      SET listing_clicks = listing_clicks + 1,
          listing_clicks_search = listing_clicks_search + 1,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'featured' THEN
      UPDATE public.business_stats
      SET listing_clicks = listing_clicks + 1,
          listing_clicks_featured = listing_clicks_featured + 1,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'top_verified' THEN
      UPDATE public.business_stats
      SET listing_clicks = listing_clicks + 1,
          listing_clicks_top_verified = listing_clicks_top_verified + 1,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'state' THEN
      UPDATE public.business_stats
      SET listing_clicks = listing_clicks + 1,
          listing_clicks_state = listing_clicks_state + 1,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'city' THEN
      UPDATE public.business_stats
      SET listing_clicks = listing_clicks + 1,
          listing_clicks_city = listing_clicks_city + 1,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSIF p_source = 'category' THEN
      UPDATE public.business_stats
      SET listing_clicks = listing_clicks + 1,
          listing_clicks_category = listing_clicks_category + 1,
          updated_at = now()
      WHERE business_id = p_business_id AND stat_date = p_stat_date;
    ELSE
      RAISE EXCEPTION 'invalid listing_click source: %', p_source;
    END IF;
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
