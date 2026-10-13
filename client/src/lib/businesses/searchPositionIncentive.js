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
