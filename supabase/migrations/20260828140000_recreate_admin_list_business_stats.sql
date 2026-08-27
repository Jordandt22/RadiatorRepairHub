DROP FUNCTION IF EXISTS public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer
);

CREATE FUNCTION public.admin_list_business_stats(
  p_start_date date,
  p_end_date date,
  p_q text DEFAULT NULL,
  p_claimed boolean DEFAULT NULL,
  p_featured boolean DEFAULT NULL,
  p_activity text DEFAULT 'all',
  p_sort text DEFAULT 'impressions_desc',
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 20
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

REVOKE EXECUTE ON FUNCTION public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_business_stats(
  date, date, text, boolean, boolean, text, text, integer, integer
) TO service_role;

NOTIFY pgrst, 'reload schema';
