import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  businessStatDateKey,
  dateKeyOffset,
} from "../lib/businessStatsDate.js";
import {
  getAdminBusinessStatsSummary,
  getAdminSearchStatsSummary,
} from "../supabase/supabase.functions.js";
import {
  cacheData,
  getCacheData,
  getPublicSiteEngagementStatsKey,
} from "../redis/redis.js";

const { SUPABASE_ERROR } = errorCodes;

const LOOKBACK_DAYS = 30;

function engagementDateWindow(days = LOOKBACK_DAYS) {
  const today = businessStatDateKey();
  return {
    startDate: dateKeyOffset(today, -(Number(days) - 1)),
    endDate: today,
  };
}

/**
 * Public directory engagement totals for marketing surfaces (pricing).
 * Returns phone clicks, page views, and searches for the last 30 days (LA).
 */
export const getPublicSiteEngagementStats = async (_req, res) => {
  const { key, interval } = getPublicSiteEngagementStatsKey();
  const cached = await getCacheData(key);
  if (cached?.data) {
    return res.status(200).json(successHandler(cached.data));
  }

  const { startDate, endDate } = engagementDateWindow(LOOKBACK_DAYS);
  const [businessRes, searchRes] = await Promise.all([
    getAdminBusinessStatsSummary({ startDate, endDate }),
    getAdminSearchStatsSummary({
      dimension: "state",
      startDate,
      endDate,
    }),
  ]);

  if (businessRes.error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error loading directory activity stats.",
          businessRes.error
        )
      );
  }

  if (searchRes.error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error loading directory search stats.",
          searchRes.error
        )
      );
  }

  const payload = {
    phoneClicksLast30Days: Number(businessRes.data?.totals?.phone_clicks || 0),
    pageViewsLast30Days: Number(businessRes.data?.totals?.page_views || 0),
    searchesLast30Days: Number(searchRes.data?.totals?.searches || 0),
    lookbackDays: LOOKBACK_DAYS,
  };

  await cacheData(key, interval, payload);
  return res.status(200).json(successHandler(payload));
};
