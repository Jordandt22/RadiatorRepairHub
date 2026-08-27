"use client";

import BusinessAnalyticsTrendChart from "@/components/pages/businesses/analytics/BusinessAnalyticsTrendChart";

function periodCaption(days) {
  if (days === 1) return "Today";
  if (days === 30) return "Each day for the last 30 days";
  if (days === "all") return "Every recorded day";
  return "Each day for the last 7 days";
}

export default function BusinessesAnalyticsTrendChart({ stats, days }) {
  return (
    <BusinessAnalyticsTrendChart
      stats={stats}
      days={days}
      title="Directory activity"
      description={`Page views, listing clicks, and impressions across tracked listings. ${periodCaption(days)}.`}
    />
  );
}
