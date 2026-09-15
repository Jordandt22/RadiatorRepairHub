-- Phone Activity: sort by phone_clicks, has_phone activity filter, cross-business event feed.

CREATE INDEX IF NOT EXISTS idx_business_phone_click_events_created_at
  ON public.business_phone_click_events USING btree (created_at DESC);

CREATE OR REPLACE FUNCTION public.admin_list_business_stats(
  p_start_date date,
  p_end_date date,
  p_q text DEFAULT NULL,
  p_claimed boolean DEFAULT NULL,
  p_featured boolean DEFAULT NULL,
  p_activity text DEFAULT 'all',
  p_sort text DEFAULT 'impressions_desc',
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 20,
  p_state_id uuid DEFAULT NULL,
  p_city_id uuid DEFAULT NULL,
  p_score_tier text DEFAULT NULL,
  p_email_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_page integer := GREATEST(1, COALESCE(p_page, 1));
  v_limit integer := LEAST(50, GREATEST(1, COALESCE(p_limit, 20)));
  v_sort text := COALESCE(p_sort, 'impressions_desc');
  v_activity text := COALESCE(p_activity, 'all');
  v_score_tier text := p_score_tier;
  v_email_filter text := p_email_filter;
  v_offset integer;
  v_result jsonb;
BEGIN
  IF v_activity NOT IN ('all', 'has_stats', 'no_stats', 'has_phone') THEN
    v_activity := 'all';
  END IF;

  IF v_score_tier IS NOT NULL AND v_score_tier NOT IN (
    'lt-3', '3-3.5', '3.5-4', '4-4.5', 'gte-4.5'
  ) THEN
    v_score_tier := NULL;
  END IF;

  IF v_email_filter IS NOT NULL AND v_email_filter NOT IN ('has', 'none') THEN
    v_email_filter := NULL;
  END IF;

  IF v_sort NOT IN (
    'impressions_desc',
    'impressions_asc',
    'listing_clicks_desc',
    'listing_clicks_asc',
    'ctr_desc',
    'ctr_asc',
    'page_views_desc',
    'page_views_asc',
    'phone_clicks_desc',
    'phone_clicks_asc',
    'title_asc',
    'title_desc'
  ) THEN
    v_sort := 'impressions_desc';
  END IF;

  v_offset := (v_page - 1) * v_limit;

  WITH stats AS (
    SELECT
      s.business_id,
      SUM(
        COALESCE(s.impressions_search, 0)
        + COALESCE(s.impressions_featured, 0)
        + COALESCE(s.impressions_top_verified, 0)
        + COALESCE(s.impressions_state, 0)
        + COALESCE(s.impressions_city, 0)
        + COALESCE(s.impressions_category, 0)
      )::bigint AS impressions,
      SUM(COALESCE(s.listing_clicks, 0))::bigint AS listing_clicks,
      SUM(COALESCE(s.page_views, 0))::bigint AS page_views,
      SUM(COALESCE(s.phone_clicks, 0))::bigint AS phone_clicks,
      SUM(COALESCE(s.directions_clicks, 0))::bigint AS directions_clicks,
      SUM(COALESCE(s.website_clicks, 0))::bigint AS website_clicks,
      SUM(COALESCE(s.email_clicks, 0))::bigint AS email_clicks
    FROM public.business_stats s
    WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
    GROUP BY s.business_id
  ),
  filtered AS (
    SELECT
      b.id,
      b.title,
      b.slug,
      COALESCE(b.is_claimed, false) AS is_claimed,
      COALESCE(b.is_featured, false) AS is_featured,
      COALESCE(st.impressions, 0) AS impressions,
      COALESCE(st.listing_clicks, 0) AS listing_clicks,
      COALESCE(st.page_views, 0) AS page_views,
      COALESCE(st.phone_clicks, 0) AS phone_clicks,
      COALESCE(st.directions_clicks, 0) AS directions_clicks,
      COALESCE(st.website_clicks, 0) AS website_clicks,
      COALESCE(st.email_clicks, 0) AS email_clicks,
      CASE
        WHEN COALESCE(st.impressions, 0) > 0
          THEN ROUND((st.listing_clicks::numeric / st.impressions) * 100, 1)
        ELSE NULL
      END AS ctr
    FROM public.businesses b
    LEFT JOIN stats st ON st.business_id = b.id
    WHERE COALESCE(b.is_test, false) = false
      AND (p_claimed IS NULL OR b.is_claimed = p_claimed)
      AND (p_featured IS NULL OR b.is_featured = p_featured)
      AND (p_state_id IS NULL OR b.state_id = p_state_id)
      AND (p_city_id IS NULL OR b.city_id = p_city_id)
      AND (
        v_score_tier IS NULL
        OR (v_score_tier = 'lt-3' AND b.total_score < 3)
        OR (v_score_tier = '3-3.5' AND b.total_score >= 3 AND b.total_score < 3.5)
        OR (v_score_tier = '3.5-4' AND b.total_score >= 3.5 AND b.total_score < 4)
        OR (v_score_tier = '4-4.5' AND b.total_score >= 4 AND b.total_score < 4.5)
        OR (v_score_tier = 'gte-4.5' AND b.total_score >= 4.5)
      )
      AND (
        v_email_filter IS NULL
        OR (v_email_filter = 'has' AND b.email IS NOT NULL AND b.email <> '')
        OR (v_email_filter = 'none' AND (b.email IS NULL OR b.email = ''))
      )
      AND (
        p_q IS NULL
        OR b.title ILIKE '%' || p_q || '%'
        OR COALESCE(b.slug, '') ILIKE '%' || p_q || '%'
      )
      AND (
        v_activity = 'all'
        OR (v_activity = 'has_stats' AND st.business_id IS NOT NULL)
        OR (v_activity = 'no_stats' AND st.business_id IS NULL)
        OR (v_activity = 'has_phone' AND COALESCE(st.phone_clicks, 0) > 0)
      )
  ),
  counted AS (
    SELECT f.*, count(*) OVER ()::integer AS total_count
    FROM filtered f
  ),
  paged AS (
    SELECT *
    FROM counted
    ORDER BY
      CASE WHEN v_sort = 'impressions_desc' THEN impressions END DESC NULLS LAST,
      CASE WHEN v_sort = 'impressions_asc' THEN impressions END ASC NULLS LAST,
      CASE WHEN v_sort = 'listing_clicks_desc' THEN listing_clicks END DESC NULLS LAST,
      CASE WHEN v_sort = 'listing_clicks_asc' THEN listing_clicks END ASC NULLS LAST,
      CASE WHEN v_sort = 'ctr_desc' THEN ctr END DESC NULLS LAST,
      CASE WHEN v_sort = 'ctr_asc' THEN ctr END ASC NULLS LAST,
      CASE WHEN v_sort = 'page_views_desc' THEN page_views END DESC NULLS LAST,
      CASE WHEN v_sort = 'page_views_asc' THEN page_views END ASC NULLS LAST,
      CASE WHEN v_sort = 'phone_clicks_desc' THEN phone_clicks END DESC NULLS LAST,
      CASE WHEN v_sort = 'phone_clicks_asc' THEN phone_clicks END ASC NULLS LAST,
      CASE WHEN v_sort = 'title_asc' THEN lower(title) END ASC NULLS LAST,
      CASE WHEN v_sort = 'title_desc' THEN lower(title) END DESC NULLS LAST,
      title ASC NULLS LAST,
      id ASC
    LIMIT v_limit OFFSET v_offset
  )
  SELECT jsonb_build_object(
    'rows', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'is_claimed', p.is_claimed,
            'is_featured', p.is_featured,
            'impressions', p.impressions,
            'listing_clicks', p.listing_clicks,
            'page_views', p.page_views,
            'phone_clicks', p.phone_clicks,
            'directions_clicks', p.directions_clicks,
            'website_clicks', p.website_clicks,
            'email_clicks', p.email_clicks,
            'ctr', p.ctr
          )
          ORDER BY
            CASE WHEN v_sort = 'impressions_desc' THEN p.impressions END DESC NULLS LAST,
            CASE WHEN v_sort = 'impressions_asc' THEN p.impressions END ASC NULLS LAST,
            CASE WHEN v_sort = 'listing_clicks_desc' THEN p.listing_clicks END DESC NULLS LAST,
            CASE WHEN v_sort = 'listing_clicks_asc' THEN p.listing_clicks END ASC NULLS LAST,
            CASE WHEN v_sort = 'ctr_desc' THEN p.ctr END DESC NULLS LAST,
            CASE WHEN v_sort = 'ctr_asc' THEN p.ctr END ASC NULLS LAST,
            CASE WHEN v_sort = 'page_views_desc' THEN p.page_views END DESC NULLS LAST,
            CASE WHEN v_sort = 'page_views_asc' THEN p.page_views END ASC NULLS LAST,
            CASE WHEN v_sort = 'phone_clicks_desc' THEN p.phone_clicks END DESC NULLS LAST,
            CASE WHEN v_sort = 'phone_clicks_asc' THEN p.phone_clicks END ASC NULLS LAST,
            CASE WHEN v_sort = 'title_asc' THEN lower(p.title) END ASC NULLS LAST,
            CASE WHEN v_sort = 'title_desc' THEN lower(p.title) END DESC NULLS LAST,
            p.title ASC NULLS LAST,
            p.id ASC
        )
        FROM paged p
      ),
      '[]'::jsonb
    ),
    'count', COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
    'page', v_page,
    'limit', v_limit
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_phone_click_events(
  p_start_date date,
  p_end_date date,
  p_q text DEFAULT NULL,
  p_claimed boolean DEFAULT NULL,
  p_featured boolean DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 25
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_page integer := GREATEST(1, COALESCE(p_page, 1));
  v_limit integer := LEAST(100, GREATEST(1, COALESCE(p_limit, 25)));
  v_offset integer;
  v_start_ts timestamptz;
  v_end_ts timestamptz;
  v_result jsonb;
BEGIN
  v_offset := (v_page - 1) * v_limit;
  v_start_ts := CASE
    WHEN p_start_date IS NULL THEN NULL
    ELSE (p_start_date::timestamp AT TIME ZONE 'America/Los_Angeles')
  END;
  v_end_ts := CASE
    WHEN p_end_date IS NULL THEN NULL
    ELSE ((p_end_date + 1)::timestamp AT TIME ZONE 'America/Los_Angeles')
  END;

  WITH filtered AS (
    SELECT
      e.id,
      e.created_at,
      b.id AS business_id,
      b.title,
      b.slug,
      COALESCE(b.is_claimed, false) AS is_claimed,
      COALESCE(b.is_featured, false) AS is_featured,
      c.name AS city_name,
      s.name AS state_name,
      s.code AS state_code
    FROM public.business_phone_click_events e
    INNER JOIN public.businesses b ON b.id = e.business_id
    LEFT JOIN public.cities c ON c.id = b.city_id
    LEFT JOIN public.states s ON s.id = b.state_id
    WHERE COALESCE(b.is_test, false) = false
      AND (v_start_ts IS NULL OR e.created_at >= v_start_ts)
      AND (v_end_ts IS NULL OR e.created_at < v_end_ts)
      AND (p_claimed IS NULL OR b.is_claimed = p_claimed)
      AND (p_featured IS NULL OR b.is_featured = p_featured)
      AND (
        p_q IS NULL
        OR b.title ILIKE '%' || p_q || '%'
        OR COALESCE(b.slug, '') ILIKE '%' || p_q || '%'
      )
  ),
  counted AS (
    SELECT f.*, count(*) OVER ()::integer AS total_count
    FROM filtered f
  ),
  paged AS (
    SELECT *
    FROM counted
    ORDER BY created_at DESC, id DESC
    LIMIT v_limit OFFSET v_offset
  )
  SELECT jsonb_build_object(
    'rows', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'createdAt', p.created_at,
            'business', jsonb_build_object(
              'id', p.business_id,
              'title', p.title,
              'slug', p.slug,
              'is_claimed', p.is_claimed,
              'is_featured', p.is_featured,
              'city', CASE
                WHEN p.city_name IS NULL THEN NULL
                ELSE jsonb_build_object('name', p.city_name)
              END,
              'state', CASE
                WHEN p.state_name IS NULL AND p.state_code IS NULL THEN NULL
                ELSE jsonb_build_object(
                  'name', p.state_name,
                  'code', p.state_code
                )
              END
            )
          )
          ORDER BY p.created_at DESC, p.id DESC
        )
        FROM paged p
      ),
      '[]'::jsonb
    ),
    'count', COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
    'page', v_page,
    'limit', v_limit
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer, uuid, uuid, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer, uuid, uuid, text, text
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_list_phone_click_events(
  date, date, text, boolean, boolean, integer, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_phone_click_events(
  date, date, text, boolean, boolean, integer, integer
) TO service_role;

NOTIFY pgrst, 'reload schema';
