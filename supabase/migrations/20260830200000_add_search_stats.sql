CREATE TABLE IF NOT EXISTS "public"."search_stats" (
  "dimension" text NOT NULL,
  "dimension_id" uuid NOT NULL,
  "stat_date" date NOT NULL,
  "searches" integer NOT NULL DEFAULT 0,
  "zero_result_searches" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "search_stats_dimension_check"
    CHECK ("dimension" IN ('state', 'city', 'category')),
  CONSTRAINT "search_stats_searches_check" CHECK ("searches" >= 0),
  CONSTRAINT "search_stats_zero_result_searches_check"
    CHECK ("zero_result_searches" >= 0)
);

ALTER TABLE "public"."search_stats" OWNER TO "postgres";

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'search_stats_pkey'
  ) THEN
    ALTER TABLE ONLY "public"."search_stats"
      ADD CONSTRAINT "search_stats_pkey"
      PRIMARY KEY ("dimension", "dimension_id", "stat_date");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_search_stats_dimension_stat_date"
  ON "public"."search_stats" USING btree ("dimension", "stat_date" DESC);

ALTER TABLE "public"."search_stats" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."search_stats" TO "anon";
GRANT ALL ON TABLE "public"."search_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."search_stats" TO "service_role";

CREATE OR REPLACE FUNCTION "public"."increment_search_stat"(
  "p_dimension" text,
  "p_dimension_id" uuid,
  "p_stat_date" date,
  "p_zero_results" boolean DEFAULT false
)
RETURNS "void"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO "public"
AS $$
DECLARE
  v_exists boolean := false;
BEGIN
  IF p_dimension IS NULL OR p_dimension_id IS NULL OR p_stat_date IS NULL THEN
    RETURN;
  END IF;

  IF p_dimension NOT IN ('state', 'city', 'category') THEN
    RETURN;
  END IF;

  IF p_dimension = 'state' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.states WHERE id = p_dimension_id
    ) INTO v_exists;
  ELSIF p_dimension = 'city' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.cities WHERE id = p_dimension_id
    ) INTO v_exists;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.primary_categories WHERE id = p_dimension_id
    ) INTO v_exists;
  END IF;

  IF NOT v_exists THEN
    RETURN;
  END IF;

  INSERT INTO public.search_stats (dimension, dimension_id, stat_date)
  VALUES (p_dimension, p_dimension_id, p_stat_date)
  ON CONFLICT (dimension, dimension_id, stat_date) DO NOTHING;

  UPDATE public.search_stats
  SET
    searches = searches + 1,
    zero_result_searches = zero_result_searches
      + CASE WHEN COALESCE(p_zero_results, false) THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE dimension = p_dimension
    AND dimension_id = p_dimension_id
    AND stat_date = p_stat_date;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_search_stat(text, uuid, date, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_search_stat(text, uuid, date, boolean)
  TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_search_stats(
  p_dimension text,
  p_start_date date,
  p_end_date date,
  p_q text DEFAULT NULL,
  p_sort text DEFAULT 'searches_desc',
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

CREATE OR REPLACE FUNCTION public.admin_summary_search_stats(
  p_dimension text,
  p_start_date date,
  p_end_date date
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
    AND (p_end_date IS NULL OR s.stat_date <= p_end_date);

  RETURN jsonb_build_object(
    'trackedCount', v_tracked,
    'totals', jsonb_build_object(
      'searches', v_searches,
      'zero_result_searches', v_zero_results
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_search_stats(
  text, date, date, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_search_stats(
  text, date, date, text, text, integer, integer
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_summary_search_stats(
  text, date, date
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_summary_search_stats(
  text, date, date
) TO service_role;
