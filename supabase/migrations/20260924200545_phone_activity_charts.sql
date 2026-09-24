-- Phone Activity charts: daily phone_clicks series + contact-channel mix
-- for businesses with at least one phone click in the period.

CREATE OR REPLACE FUNCTION public.admin_summary_business_stats(
  p_start_date date,
  p_end_date date,
  p_claimed boolean DEFAULT NULL,
  p_featured boolean DEFAULT NULL,
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
  v_score_tier text := p_score_tier;
  v_email_filter text := p_email_filter;
  v_phone_contact jsonb;
BEGIN
  IF v_score_tier IS NOT NULL AND v_score_tier NOT IN (
    'lt-3', '3-3.5', '3.5-4', '4-4.5', 'gte-4.5'
  ) THEN
    v_score_tier := NULL;
  END IF;

  IF v_email_filter IS NOT NULL AND v_email_filter NOT IN ('has', 'none') THEN
    v_email_filter := NULL;
  END IF;

  WITH eligible AS (
    SELECT b.id
    FROM public.businesses b
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
      SUM(COALESCE(s.page_views, 0))::bigint AS page_views,
      SUM(COALESCE(s.phone_clicks, 0))::bigint AS phone_clicks
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
            'page_views', d.page_views,
            'phone_clicks', d.phone_clicks
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

  WITH eligible AS (
    SELECT b.id, b.email, b.website
    FROM public.businesses b
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
  ),
  phone_businesses AS (
    SELECT
      e.id,
      (e.email IS NOT NULL AND e.email <> '') AS has_email,
      (e.website IS NOT NULL AND e.website <> '') AS has_website
    FROM eligible e
    INNER JOIN (
      SELECT s.business_id
      FROM public.business_stats s
      INNER JOIN eligible el ON el.id = s.business_id
      WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
        AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
      GROUP BY s.business_id
      HAVING SUM(COALESCE(s.phone_clicks, 0)) > 0
    ) ph ON ph.business_id = e.id
  ),
  bucket_counts AS (
    SELECT
      COUNT(*) FILTER (
        WHERE has_email AND has_website
      )::integer AS both_count,
      COUNT(*) FILTER (
        WHERE has_email AND NOT has_website
      )::integer AS email_count,
      COUNT(*) FILTER (
        WHERE NOT has_email AND has_website
      )::integer AS website_count,
      COUNT(*) FILTER (
        WHERE NOT has_email AND NOT has_website
      )::integer AS none_count,
      COUNT(*)::integer AS total_count
    FROM phone_businesses
  )
  SELECT jsonb_build_object(
    'total', COALESCE(bc.total_count, 0),
    'slices', jsonb_build_array(
      jsonb_build_object(
        'key', 'email',
        'label', 'Email Only',
        'count', COALESCE(bc.email_count, 0)
      ),
      jsonb_build_object(
        'key', 'website',
        'label', 'Website Only',
        'count', COALESCE(bc.website_count, 0)
      ),
      jsonb_build_object(
        'key', 'both',
        'label', 'Both',
        'count', COALESCE(bc.both_count, 0)
      ),
      jsonb_build_object(
        'key', 'none',
        'label', 'None',
        'count', COALESCE(bc.none_count, 0)
      )
    )
  )
  INTO v_phone_contact
  FROM bucket_counts bc;

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
    'daily', v_daily,
    'phone_contact', COALESCE(
      v_phone_contact,
      jsonb_build_object(
        'total', 0,
        'slices', jsonb_build_array(
          jsonb_build_object('key', 'email', 'label', 'Email Only', 'count', 0),
          jsonb_build_object('key', 'website', 'label', 'Website Only', 'count', 0),
          jsonb_build_object('key', 'both', 'label', 'Both', 'count', 0),
          jsonb_build_object('key', 'none', 'label', 'None', 'count', 0)
        )
      )
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_summary_business_stats(
  date, date, boolean, boolean, uuid, uuid, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_summary_business_stats(
  date, date, boolean, boolean, uuid, uuid, text, text
) TO service_role;
