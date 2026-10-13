export const SEARCH_POSITION_INCENTIVE_DAYS = 30;
export const SEARCH_POSITION_INCENTIVE_MIN_IMPRESSIONS = 10;
export const SEARCH_POSITION_FIRST_PAGE = 12;

/**
 * Average search position for the claim banner.
 * Returns null unless the rounded position is past the first page of 12
 * and there are enough search impressions to trust the average.
 */
export function qualifySearchPositionIncentive(impressions, positionSum) {
  const count = Number(impressions) || 0;
  const sum = Number(positionSum) || 0;
  if (count < SEARCH_POSITION_INCENTIVE_MIN_IMPRESSIONS) return null;

  const avgPosition = Math.round((sum / count) * 10) / 10;
  if (Math.round(avgPosition) <= SEARCH_POSITION_FIRST_PAGE) return null;

  return { avgPosition, impressions: count };
}

export function formatSearchPositionOrdinal(position) {
  const n = Math.round(Number(position));
  if (!Number.isFinite(n) || n <= 0) return null;

  const mod100 = n % 100;
  const mod10 = n % 10;
  let suffix = "th";
  if (mod100 < 11 || mod100 > 13) {
    if (mod10 === 1) suffix = "st";
    else if (mod10 === 2) suffix = "nd";
    else if (mod10 === 3) suffix = "rd";
  }

  return `${n}${suffix}`;
}

export function formatSearchPositionIncentiveCopy(incentive) {
  const ordinal = formatSearchPositionOrdinal(incentive?.avgPosition);
  if (!ordinal) return null;

  return `Shoppers are finding you around ${ordinal} in search, past the first page. Claimed listings are shown ahead of unclaimed ones, so claiming yours moves you up.`;
}
