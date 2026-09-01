DROP FUNCTION IF EXISTS public.owner_competitor_insights(uuid, date, date, integer);

CREATE FUNCTION public.owner_competitor_insights(
  p_business_id uuid,
  p_start_date date,
  p_end_date date,
  p_limit integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_limit integer := LEAST(25, GREATEST(3, COALESCE(p_limit, 10)));
  v_min_market constant integer := 3;
  v_city_id uuid;
  v_city_name text;
  v_city_slug text;
  v_state_code text;
  v_market_size integer := 0;
  v_result jsonb;
BEGIN
  SELECT b.city_id, c.name, c.slug, st.code
  INTO v_city_id, v_city_name, v_city_slug, v_state_code
  FROM public.businesses b
  LEFT JOIN public.cities c ON c.id = b.city_id
  LEFT JOIN public.states st ON st.id = b.state_id
  WHERE b.id = p_business_id;

  IF v_city_id IS NULL THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'no_city',
      'minMarketSize', v_min_market
    );
  END IF;

  SELECT COUNT(*)::integer
  INTO v_market_size
  FROM public.businesses b
  WHERE b.city_id = v_city_id
    AND COALESCE(b.is_test, false) = false;

  -- Withhold competitor data in very small markets so per-shop activity
  -- cannot be inferred from aggregate counts.
  IF v_market_size < v_min_market THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'small_market',
      'minMarketSize', v_min_market,
      'city', jsonb_build_object(
        'id', v_city_id,
        'name', v_city_name,
        'slug', v_city_slug,
        'stateCode', v_state_code
      ),
      'market', jsonb_build_object('totalListings', v_market_size)
    );
  END IF;

  WITH peers AS (
    SELECT
      b.id,
      b.title,
      b.slug,
      COALESCE(b.is_claimed, false) AS is_claimed,
      COALESCE(b.is_featured, false) AS is_featured,
      b.total_score,
      b.reviews_count
    FROM public.businesses b
    WHERE b.city_id = v_city_id
      AND COALESCE(b.is_test, false) = false
  ),
  stats AS (
    SELECT
      s.business_id,
      SUM(
        COALESCE(s.impressions_search, 0)
        + COALESCE(s.impressions_featured, 0)
        + COALESCE(s.impressions_top_verified, 0)
        + COALESCE(s.impressions_state, 0)
        + COALESCE(s.impressions_city, 0)
        + COALESCE(s.impressions_category, 0)
        + COALESCE(s.impressions_nearby, 0)
      )::bigint AS impressions,
      SUM(
        COALESCE(s.search_position_sum, 0)
        + COALESCE(s.featured_position_sum, 0)
        + COALESCE(s.top_verified_position_sum, 0)
        + COALESCE(s.state_position_sum, 0)
        + COALESCE(s.city_position_sum, 0)
        + COALESCE(s.category_position_sum, 0)
        + COALESCE(s.nearby_position_sum, 0)
      )::bigint AS position_sum,
      SUM(COALESCE(s.listing_clicks, 0))::bigint AS listing_clicks
    FROM public.business_stats s
    JOIN peers p ON p.id = s.business_id
    WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
      AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
    GROUP BY s.business_id
  ),
  joined AS (
    SELECT
      p.id,
      p.title,
      p.slug,
      p.is_claimed,
      p.is_featured,
      p.total_score,
      p.reviews_count,
      COALESCE(s.impressions, 0)::bigint AS impressions,
      COALESCE(s.listing_clicks, 0)::bigint AS listing_clicks,
      CASE
        WHEN COALESCE(s.impressions, 0) > 0
          THEN ROUND((COALESCE(s.listing_clicks, 0)::numeric / s.impressions) * 100, 1)
        ELSE NULL
      END AS ctr,
      CASE
        WHEN COALESCE(s.impressions, 0) > 0
          THEN ROUND(COALESCE(s.position_sum, 0)::numeric / s.impressions, 1)
        ELSE NULL
      END AS avg_position
    FROM peers p
    LEFT JOIN stats s ON s.business_id = p.id
  ),
  ranked AS (
    SELECT
      j.*,
      (RANK() OVER (ORDER BY j.impressions DESC))::integer AS impressions_rank,
      (RANK() OVER (ORDER BY j.listing_clicks DESC))::integer AS clicks_rank
    FROM joined j
  )
  SELECT jsonb_build_object(
    'available', true,
    'minMarketSize', v_min_market,
    'city', jsonb_build_object(
      'id', v_city_id,
      'name', v_city_name,
      'slug', v_city_slug,
      'stateCode', v_state_code
    ),
    'market', jsonb_build_object(
      'totalListings', (SELECT COUNT(*)::integer FROM ranked),
      'claimedListings', (SELECT (COUNT(*) FILTER (WHERE is_claimed))::integer FROM ranked),
      'featuredListings', (SELECT (COUNT(*) FILTER (WHERE is_featured))::integer FROM ranked),
      'totalImpressions', (SELECT COALESCE(SUM(impressions), 0)::bigint FROM ranked),
      'totalListingClicks', (SELECT COALESCE(SUM(listing_clicks), 0)::bigint FROM ranked),
      'medianImpressions', (
        SELECT ROUND(
          (percentile_cont(0.5) WITHIN GROUP (ORDER BY impressions::double precision))::numeric,
          1
        )
        FROM ranked
      ),
      'medianCtr', (
        SELECT ROUND(
          (percentile_cont(0.5) WITHIN GROUP (ORDER BY ctr::double precision))::numeric,
          1
        )
        FROM ranked
        WHERE ctr IS NOT NULL
      ),
      'medianAvgPosition', (
        SELECT ROUND(
          (percentile_cont(0.5) WITHIN GROUP (ORDER BY avg_position::double precision))::numeric,
          1
        )
        FROM ranked
        WHERE avg_position IS NOT NULL
      )
    ),
    'self', (
      SELECT jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'slug', r.slug,
        'isClaimed', r.is_claimed,
        'isFeatured', r.is_featured,
        'totalScore', r.total_score,
        'reviewsCount', r.reviews_count,
        'impressions', r.impressions,
        'listingClicks', r.listing_clicks,
        'ctr', r.ctr,
        'avgPosition', r.avg_position,
        'impressionsRank', r.impressions_rank,
        'clicksRank', r.clicks_rank
      )
      FROM ranked r
      WHERE r.id = p_business_id
    ),
    'competitors', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'title', t.title,
            'slug', t.slug,
            'isClaimed', t.is_claimed,
            'isFeatured', t.is_featured,
            'totalScore', t.total_score,
            'reviewsCount', t.reviews_count,
            'impressions', t.impressions,
            'listingClicks', t.listing_clicks,
            'ctr', t.ctr,
            'avgPosition', t.avg_position,
            'impressionsRank', t.impressions_rank,
            'clicksRank', t.clicks_rank
          )
          ORDER BY t.impressions DESC, t.listing_clicks DESC, lower(t.title) ASC
        )
        FROM (
          SELECT *
          FROM ranked
          WHERE id <> p_business_id
          ORDER BY impressions DESC, listing_clicks DESC, lower(title) ASC
          LIMIT v_limit
        ) t
      ),
      '[]'::jsonb
    )
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.owner_competitor_insights(uuid, date, date, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_competitor_insights(uuid, date, date, integer)
  TO service_role;

NOTIFY pgrst, 'reload schema';
