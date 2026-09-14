-- Uncapped per-business stats aggregates for admin CSV export.
CREATE OR REPLACE FUNCTION public.admin_export_business_stats(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  business_id uuid,
  impressions bigint,
  listing_clicks bigint,
  page_views bigint,
  phone_clicks bigint,
  directions_clicks bigint,
  website_clicks bigint,
  email_clicks bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    SUM(COALESCE(s.listing_clicks, 0))::bigint AS listing_clicks,
    SUM(COALESCE(s.page_views, 0))::bigint AS page_views,
    SUM(COALESCE(s.phone_clicks, 0))::bigint AS phone_clicks,
    SUM(COALESCE(s.directions_clicks, 0))::bigint AS directions_clicks,
    SUM(COALESCE(s.website_clicks, 0))::bigint AS website_clicks,
    SUM(COALESCE(s.email_clicks, 0))::bigint AS email_clicks
  FROM public.business_stats s
  WHERE (p_start_date IS NULL OR s.stat_date >= p_start_date)
    AND (p_end_date IS NULL OR s.stat_date <= p_end_date)
  GROUP BY s.business_id;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_export_business_stats(date, date)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_export_business_stats(date, date)
  TO service_role;

NOTIFY pgrst, 'reload schema';
