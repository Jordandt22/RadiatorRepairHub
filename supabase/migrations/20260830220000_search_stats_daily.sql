CREATE OR REPLACE FUNCTION public.admin_summary_search_stats(
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
  v_daily jsonb;
  v_start text;
  v_end text;
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

  WITH filtered AS (
    SELECT
      s.stat_date,
      COALESCE(s.searches, 0) AS searches,
      COALESCE(s.zero_result_searches, 0) AS zero_result_searches
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
      )
  ),
  daily AS (
    SELECT
      f.stat_date,
      SUM(f.searches)::bigint AS searches,
      SUM(f.zero_result_searches)::bigint AS zero_result_searches
    FROM filtered f
    GROUP BY f.stat_date
  )
  SELECT
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'stat_date', d.stat_date,
            'searches', d.searches,
            'zero_result_searches', d.zero_result_searches
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

  RETURN jsonb_build_object(
    'trackedCount', v_tracked,
    'startDate', v_start,
    'endDate', v_end,
    'totals', jsonb_build_object(
      'searches', v_searches,
      'zero_result_searches', v_zero_results
    ),
    'daily', v_daily
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
