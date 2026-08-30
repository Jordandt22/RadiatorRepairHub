DROP FUNCTION IF EXISTS public.admin_list_search_stats(
  text, date, date, text, text, integer, integer
);
DROP FUNCTION IF EXISTS public.admin_summary_search_stats(text, date, date);
DROP FUNCTION IF EXISTS public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer
);
DROP FUNCTION IF EXISTS public.admin_summary_business_stats(
  date, date, boolean, boolean
);

CREATE FUNCTION public.admin_list_search_stats(
  p_dimension text,
  p_start_date date,
  p_end_date date,
  p_q text DEFAULT NULL,
  p_sort text DEFAULT 'searches_desc',
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 20,
  p_dimension_id uuid DEFAULT NULL,
  p_state_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dimension text := COALESCE(p_dimension, 'state');
  v_page integer := GREATEST(1, COALESCE(p_page, 1));
  v_limit integer := LEAST(50, GREATEST(1, COALESCE(p_limit, 20)));
  v_sort text := COALESCE(p_sort, 'searches_desc');
  v_offset integer;
  v_result jsonb;
BEGIN
  IF v_dimension NOT IN ('state', 'city', 'category') THEN
    v_dimension := 'state';
  END IF;

  IF v_sort NOT IN (
    'searches_desc',
    'searches_asc',
    'zero_results_desc',
    'zero_results_asc',
    'businesses_desc',
    'businesses_asc',
    'claimed_desc',
    'claimed_asc',
    'featured_desc',
    'featured_asc',
    'name_asc',
    'name_desc'
  ) THEN
    v_sort := 'searches_desc';
  END IF;

  v_offset := (v_page - 1) * v_limit;

  WITH stats AS (
    SELECT
      s.dimension_id,
      SUM(COALESCE(s.searches, 0))::bigint AS searches,
      SUM(COALESCE(s.zero_result_searches, 0))::bigint AS zero_result_searches
    FROM public.search_stats s
    WHERE s.dimension = v_dimension
      AND (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
      AND (p_dimension_id IS NULL OR s.dimension_id = p_dimension_id)
    GROUP BY s.dimension_id
  ),
  inventory AS (
    SELECT
      CASE
        WHEN v_dimension = 'state' THEN b.state_id
        WHEN v_dimension = 'city' THEN b.city_id
        ELSE b.primary_category_id
      END AS dimension_id,
      COUNT(*)::bigint AS business_count,
      COUNT(*) FILTER (WHERE COALESCE(b.is_claimed, false))::bigint AS claimed_count,
      COUNT(*) FILTER (WHERE COALESCE(b.is_featured, false))::bigint AS featured_count
    FROM public.businesses b
    WHERE COALESCE(b.is_test, false) = false
    GROUP BY 1
  ),
  named AS (
    SELECT
      st.id,
      st.name,
      st.code,
      NULL::text AS state_name,
      NULL::text AS state_code,
      NULL::text AS slug,
      s.searches,
      s.zero_result_searches,
      COALESCE(i.business_count, 0) AS business_count,
      COALESCE(i.claimed_count, 0) AS claimed_count,
      COALESCE(i.featured_count, 0) AS featured_count
    FROM stats s
    INNER JOIN public.states st ON st.id = s.dimension_id
    LEFT JOIN inventory i ON i.dimension_id = s.dimension_id
    WHERE v_dimension = 'state'
      AND (p_dimension_id IS NULL OR st.id = p_dimension_id)
      AND (
        p_q IS NULL
        OR st.name ILIKE '%' || p_q || '%'
        OR COALESCE(st.code, '') ILIKE '%' || p_q || '%'
      )

    UNION ALL

    SELECT
      c.id,
      c.name,
      NULL::text AS code,
      st.name AS state_name,
      st.code AS state_code,
      c.slug,
      s.searches,
      s.zero_result_searches,
      COALESCE(i.business_count, 0) AS business_count,
      COALESCE(i.claimed_count, 0) AS claimed_count,
      COALESCE(i.featured_count, 0) AS featured_count
    FROM stats s
    INNER JOIN public.cities c ON c.id = s.dimension_id
    INNER JOIN public.states st ON st.id = c.state_id
    LEFT JOIN inventory i ON i.dimension_id = s.dimension_id
    WHERE v_dimension = 'city'
      AND (p_dimension_id IS NULL OR c.id = p_dimension_id)
      AND (p_state_id IS NULL OR c.state_id = p_state_id)
      AND (
        p_q IS NULL
        OR c.name ILIKE '%' || p_q || '%'
        OR st.name ILIKE '%' || p_q || '%'
        OR COALESCE(st.code, '') ILIKE '%' || p_q || '%'
      )

    UNION ALL

    SELECT
      pc.id,
      pc.name,
      NULL::text AS code,
      NULL::text AS state_name,
      NULL::text AS state_code,
      pc.slug,
      s.searches,
      s.zero_result_searches,
      COALESCE(i.business_count, 0) AS business_count,
      COALESCE(i.claimed_count, 0) AS claimed_count,
      COALESCE(i.featured_count, 0) AS featured_count
    FROM stats s
    INNER JOIN public.primary_categories pc ON pc.id = s.dimension_id
    LEFT JOIN inventory i ON i.dimension_id = s.dimension_id
    WHERE v_dimension = 'category'
      AND (p_dimension_id IS NULL OR pc.id = p_dimension_id)
      AND (
        p_q IS NULL
        OR pc.name ILIKE '%' || p_q || '%'
        OR COALESCE(pc.slug, '') ILIKE '%' || p_q || '%'
      )
  ),
  counted AS (
    SELECT n.*, count(*) OVER ()::integer AS total_count
    FROM named n
  ),
  paged AS (
    SELECT *
    FROM counted
    ORDER BY
      CASE WHEN v_sort = 'searches_desc' THEN searches END DESC NULLS LAST,
      CASE WHEN v_sort = 'searches_asc' THEN searches END ASC NULLS LAST,
      CASE WHEN v_sort = 'zero_results_desc' THEN zero_result_searches END DESC NULLS LAST,
      CASE WHEN v_sort = 'zero_results_asc' THEN zero_result_searches END ASC NULLS LAST,
      CASE WHEN v_sort = 'businesses_desc' THEN business_count END DESC NULLS LAST,
      CASE WHEN v_sort = 'businesses_asc' THEN business_count END ASC NULLS LAST,
      CASE WHEN v_sort = 'claimed_desc' THEN claimed_count END DESC NULLS LAST,
      CASE WHEN v_sort = 'claimed_asc' THEN claimed_count END ASC NULLS LAST,
      CASE WHEN v_sort = 'featured_desc' THEN featured_count END DESC NULLS LAST,
      CASE WHEN v_sort = 'featured_asc' THEN featured_count END ASC NULLS LAST,
      CASE WHEN v_sort = 'name_asc' THEN lower(name) END ASC NULLS LAST,
      CASE WHEN v_sort = 'name_desc' THEN lower(name) END DESC NULLS LAST,
      name ASC NULLS LAST,
      id ASC
    LIMIT v_limit OFFSET v_offset
  )
  SELECT jsonb_build_object(
    'rows', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'code', p.code,
            'state_name', p.state_name,
            'state_code', p.state_code,
            'slug', p.slug,
            'searches', p.searches,
            'zero_result_searches', p.zero_result_searches,
            'business_count', p.business_count,
            'claimed_count', p.claimed_count,
            'featured_count', p.featured_count
          )
          ORDER BY
            CASE WHEN v_sort = 'searches_desc' THEN p.searches END DESC NULLS LAST,
            CASE WHEN v_sort = 'searches_asc' THEN p.searches END ASC NULLS LAST,
            CASE WHEN v_sort = 'zero_results_desc' THEN p.zero_result_searches END DESC NULLS LAST,
            CASE WHEN v_sort = 'zero_results_asc' THEN p.zero_result_searches END ASC NULLS LAST,
            CASE WHEN v_sort = 'businesses_desc' THEN p.business_count END DESC NULLS LAST,
            CASE WHEN v_sort = 'businesses_asc' THEN p.business_count END ASC NULLS LAST,
            CASE WHEN v_sort = 'claimed_desc' THEN p.claimed_count END DESC NULLS LAST,
            CASE WHEN v_sort = 'claimed_asc' THEN p.claimed_count END ASC NULLS LAST,
            CASE WHEN v_sort = 'featured_desc' THEN p.featured_count END DESC NULLS LAST,
            CASE WHEN v_sort = 'featured_asc' THEN p.featured_count END ASC NULLS LAST,
            CASE WHEN v_sort = 'name_asc' THEN lower(p.name) END ASC NULLS LAST,
            CASE WHEN v_sort = 'name_desc' THEN lower(p.name) END DESC NULLS LAST,
            p.name ASC NULLS LAST,
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

CREATE FUNCTION public.admin_summary_search_stats(
  p_dimension text,
  p_start_date date,
  p_end_date date,
  p_dimension_id uuid DEFAULT NULL,
  p_state_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dimension text := COALESCE(p_dimension, 'state');
  v_tracked integer := 0;
  v_searches bigint := 0;
  v_zero_results bigint := 0;
BEGIN
  IF v_dimension NOT IN ('state', 'city', 'category') THEN
    v_dimension := 'state';
  END IF;

  SELECT
    COUNT(DISTINCT s.dimension_id)::integer,
    COALESCE(SUM(s.searches), 0),
    COALESCE(SUM(s.zero_result_searches), 0)
  INTO v_tracked, v_searches, v_zero_results
  FROM public.search_stats s
  WHERE s.dimension = v_dimension
    AND (p_start_date IS NULL OR s.stat_date >= p_start_date)
    AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
    AND (p_dimension_id IS NULL OR s.dimension_id = p_dimension_id)
    AND (
      p_state_id IS NULL
      OR v_dimension <> 'city'
      OR s.dimension_id IN (
        SELECT c.id FROM public.cities c WHERE c.state_id = p_state_id
      )
    );

  RETURN jsonb_build_object(
    'trackedCount', v_tracked,
    'totals', jsonb_build_object(
      'searches', v_searches,
      'zero_result_searches', v_zero_results
    )
  );
END;
$$;

CREATE FUNCTION public.admin_list_business_stats(
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
  p_city_id uuid DEFAULT NULL
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
  v_offset integer;
  v_result jsonb;
BEGIN
  IF v_activity NOT IN ('all', 'has_stats', 'no_stats') THEN
    v_activity := 'all';
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
        p_q IS NULL
        OR b.title ILIKE '%' || p_q || '%'
        OR COALESCE(b.slug, '') ILIKE '%' || p_q || '%'
      )
      AND (
        v_activity = 'all'
        OR (v_activity = 'has_stats' AND st.business_id IS NOT NULL)
        OR (v_activity = 'no_stats' AND st.business_id IS NULL)
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

CREATE FUNCTION public.admin_summary_business_stats(
  p_start_date date,
  p_end_date date,
  p_claimed boolean DEFAULT NULL,
  p_featured boolean DEFAULT NULL,
  p_state_id uuid DEFAULT NULL,
  p_city_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_eligible integer;
  v_tracked integer;
  v_impressions bigint;
  v_listing_clicks bigint;
  v_page_views bigint;
  v_phone_clicks bigint;
  v_directions_clicks bigint;
  v_website_clicks bigint;
  v_email_clicks bigint;
  v_start text;
  v_end text;
  v_daily jsonb;
  v_ctr numeric;
BEGIN
  WITH eligible AS (
    SELECT b.id
    FROM public.businesses b
    WHERE COALESCE(b.is_test, false) = false
      AND (p_claimed IS NULL OR b.is_claimed = p_claimed)
      AND (p_featured IS NULL OR b.is_featured = p_featured)
      AND (p_state_id IS NULL OR b.state_id = p_state_id)
      AND (p_city_id IS NULL OR b.city_id = p_city_id)
  )
  SELECT count(*)::integer INTO v_eligible FROM eligible;

  WITH eligible AS (
    SELECT b.id
    FROM public.businesses b
    WHERE COALESCE(b.is_test, false) = false
      AND (p_claimed IS NULL OR b.is_claimed = p_claimed)
      AND (p_featured IS NULL OR b.is_featured = p_featured)
      AND (p_state_id IS NULL OR b.state_id = p_state_id)
      AND (p_city_id IS NULL OR b.city_id = p_city_id)
  ),
  tracked AS (
    SELECT DISTINCT s.business_id
    FROM public.business_stats s
    INNER JOIN eligible e ON e.id = s.business_id
    WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
  )
  SELECT count(*)::integer INTO v_tracked FROM tracked;

  WITH eligible AS (
    SELECT b.id
    FROM public.businesses b
    WHERE COALESCE(b.is_test, false) = false
      AND (p_claimed IS NULL OR b.is_claimed = p_claimed)
      AND (p_featured IS NULL OR b.is_featured = p_featured)
      AND (p_state_id IS NULL OR b.state_id = p_state_id)
      AND (p_city_id IS NULL OR b.city_id = p_city_id)
  ),
  tracked AS (
    SELECT DISTINCT s.business_id
    FROM public.business_stats s
    INNER JOIN eligible e ON e.id = s.business_id
    WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
  )
  SELECT
    COALESCE(SUM(
      COALESCE(s.impressions_search, 0)
      + COALESCE(s.impressions_featured, 0)
      + COALESCE(s.impressions_top_verified, 0)
      + COALESCE(s.impressions_state, 0)
      + COALESCE(s.impressions_city, 0)
      + COALESCE(s.impressions_category, 0)
    ), 0),
    COALESCE(SUM(s.listing_clicks), 0),
    COALESCE(SUM(s.page_views), 0),
    COALESCE(SUM(s.phone_clicks), 0),
    COALESCE(SUM(s.directions_clicks), 0),
    COALESCE(SUM(s.website_clicks), 0),
    COALESCE(SUM(s.email_clicks), 0)
  INTO
    v_impressions,
    v_listing_clicks,
    v_page_views,
    v_phone_clicks,
    v_directions_clicks,
    v_website_clicks,
    v_email_clicks
  FROM public.business_stats s
  INNER JOIN tracked t ON t.business_id = s.business_id
  WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
    AND (p_end_date IS NULL OR s.stat_date <= p_end_date);

  WITH eligible AS (
    SELECT b.id
    FROM public.businesses b
    WHERE COALESCE(b.is_test, false) = false
      AND (p_claimed IS NULL OR b.is_claimed = p_claimed)
      AND (p_featured IS NULL OR b.is_featured = p_featured)
      AND (p_state_id IS NULL OR b.state_id = p_state_id)
      AND (p_city_id IS NULL OR b.city_id = p_city_id)
  ),
  tracked AS (
    SELECT DISTINCT s.business_id
    FROM public.business_stats s
    INNER JOIN eligible e ON e.id = s.business_id
    WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
  ),
  daily AS (
    SELECT
      s.stat_date,
      SUM(
        COALESCE(s.impressions_search, 0)
        + COALESCE(s.impressions_featured, 0)
        + COALESCE(s.impressions_top_verified, 0)
        + COALESCE(s.impressions_state, 0)
        + COALESCE(s.impressions_city, 0)
        + COALESCE(s.impressions_category, 0)
      )::bigint AS impressions,
      SUM(COALESCE(s.listing_clicks, 0))::bigint AS listing_clicks,
      SUM(COALESCE(s.page_views, 0))::bigint AS page_views
    FROM public.business_stats s
    INNER JOIN tracked t ON t.business_id = s.business_id
    WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
    GROUP BY s.stat_date
  )
  SELECT
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'stat_date', d.stat_date,
            'impressions', d.impressions,
            'listing_clicks', d.listing_clicks,
            'page_views', d.page_views
          )
          ORDER BY d.stat_date
        )
        FROM daily d
      ),
      '[]'::jsonb
    ),
    COALESCE(p_start_date::text, (SELECT min(stat_date)::text FROM daily)),
    COALESCE(p_end_date::text, (SELECT max(stat_date)::text FROM daily))
  INTO v_daily, v_start, v_end;

  IF v_impressions > 0 THEN
    v_ctr := ROUND((v_listing_clicks::numeric / v_impressions) * 100, 1);
  ELSE
    v_ctr := NULL;
  END IF;

  RETURN jsonb_build_object(
    'eligibleCount', v_eligible,
    'trackedCount', v_tracked,
    'startDate', v_start,
    'endDate', v_end,
    'totals', jsonb_build_object(
      'impressions', v_impressions,
      'listing_clicks', v_listing_clicks,
      'page_views', v_page_views,
      'phone_clicks', v_phone_clicks,
      'directions_clicks', v_directions_clicks,
      'website_clicks', v_website_clicks,
      'email_clicks', v_email_clicks
    ),
    'averages', jsonb_build_object(
      'impressions', CASE
        WHEN v_tracked > 0 THEN ROUND(v_impressions::numeric / v_tracked, 1)
        ELSE 0
      END,
      'listing_clicks', CASE
        WHEN v_tracked > 0 THEN ROUND(v_listing_clicks::numeric / v_tracked, 1)
        ELSE 0
      END,
      'page_views', CASE
        WHEN v_tracked > 0 THEN ROUND(v_page_views::numeric / v_tracked, 1)
        ELSE 0
      END,
      'phone_clicks', CASE
        WHEN v_tracked > 0 THEN ROUND(v_phone_clicks::numeric / v_tracked, 1)
        ELSE 0
      END,
      'directions_clicks', CASE
        WHEN v_tracked > 0 THEN ROUND(v_directions_clicks::numeric / v_tracked, 1)
        ELSE 0
      END,
      'website_clicks', CASE
        WHEN v_tracked > 0 THEN ROUND(v_website_clicks::numeric / v_tracked, 1)
        ELSE 0
      END,
      'email_clicks', CASE
        WHEN v_tracked > 0 THEN ROUND(v_email_clicks::numeric / v_tracked, 1)
        ELSE 0
      END
    ),
    'ctr', v_ctr,
    'daily', v_daily
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_search_stats(
  text, date, date, text, text, integer, integer, uuid, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_search_stats(
  text, date, date, text, text, integer, integer, uuid, uuid
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_summary_search_stats(
  text, date, date, uuid, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_summary_search_stats(
  text, date, date, uuid, uuid
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer, uuid, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer, uuid, uuid
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_summary_business_stats(
  date, date, boolean, boolean, uuid, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_summary_business_stats(
  date, date, boolean, boolean, uuid, uuid
) TO service_role;

NOTIFY pgrst, 'reload schema';
