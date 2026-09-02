import {
  WEEKLY_DIGEST_CLAIMED_BASIC_MESSAGE,
  WEEKLY_DIGEST_FEATURED_MESSAGE,
  WEEKLY_DIGEST_UNCLAIMED_MESSAGE,
  SENDER_NAME,
  buildBusinessClaimLink,
  getWebBaseUrl,
} from "./constants/messages.js";
import { isOutreachDevRedirect } from "./outreachSend.js";
import { DIGEST_TIERS } from "./weeklyDigestStats.js";
import {
  buildOneClickUnsubscribeUrl,
  buildUnsubscribeUrl,
  signUnsubscribeToken,
} from "./unsubscribeToken.js";

const SOURCE_LABELS = {
  search: "Search results",
  featured: "Featured placements",
  top_verified: "Top Verified",
  state: "State pages",
  city: "City pages",
  category: "Category pages",
  nearby: "Nearby results",
};

const CALL_BUTTON_INTEREST_NOTE =
  "Some people clicked your phone button this week.";

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatDelta(delta) {
  if (!delta || typeof delta.change !== "number") return "";
  const sign = delta.change > 0 ? "+" : "";
  if (delta.percent == null) {
    return `${sign}${formatCount(delta.change)} vs prior week`;
  }
  return `${sign}${delta.percent}% vs prior week`;
}

function formatRate(value) {
  if (value == null) return "—";
  return `${value}%`;
}

function formatPosition(value) {
  if (value == null) return "—";
  return String(value);
}

function sectionHeading(title) {
  return `
  <tr>
    <td style="padding: 24px 0 8px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5b6b7c;">
      ${title}
    </td>
  </tr>`;
}

function metricRow({ label, value, description, delta = "" }) {
  const deltaHtml = delta
    ? `<div style="margin-top: 4px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #2f6f4e;">${delta}</div>`
    : "";
  return `
  <tr>
    <td style="padding: 14px 0; border-bottom: 1px solid #e6ebf0; font-family: Arial, Helvetica, sans-serif;">
      <div style="font-size: 13px; font-weight: 600; color: #1a2332;">${label}</div>
      <div style="margin-top: 4px; font-size: 28px; line-height: 1.15; font-weight: 700; color: #0f2744;">${value}</div>
      ${deltaHtml}
      <div style="margin-top: 6px; font-size: 12px; line-height: 1.45; color: #667788;">${description}</div>
    </td>
  </tr>`;
}

function callInterestCallout() {
  return `
  <tr>
    <td style="padding: 16px 0 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px;">
        <tr>
          <td style="padding: 14px 16px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.45; color: #9a3412;">
            <strong style="display: block; margin-bottom: 4px;">Phone interest</strong>
            ${CALL_BUTTON_INTEREST_NOTE}
            <div style="margin-top: 6px; font-size: 12px; color: #c2410c;">
              This means someone tapped the phone button on your listing. Exact counts unlock with Featured.
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function sourceBreakdownHtml(impressionsBySource) {
  if (!impressionsBySource || typeof impressionsBySource !== "object") {
    return "";
  }
  const entries = Object.entries(impressionsBySource).filter(
    ([, count]) => Number(count || 0) > 0
  );
  if (entries.length === 0) return "";

  const rows = entries
    .map(
      ([source, count]) => `
      <tr>
        <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; border-bottom: 1px solid #eef2f6;">
          ${SOURCE_LABELS[source] || source}
        </td>
        <td align="right" style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; color: #0f2744; border-bottom: 1px solid #eef2f6;">
          ${formatCount(count)}
        </td>
      </tr>`
    )
    .join("");

  return `
  ${sectionHeading("Where people saw you")}
  <tr>
    <td style="padding: 4px 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.45; color: #667788;">
      Impressions broken down by the part of RadiatorRepairHub where your shop appeared.
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${rows}
      </table>
    </td>
  </tr>`;
}

function wrapStatsSections(innerHtml) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
    ${innerHtml}
  </table>`;
}

export function buildWeeklyDigestStatsHtml(digestStats) {
  const totals = digestStats?.totals ?? {};
  const comparisonTotals = digestStats?.comparison?.totals ?? {};
  let sections = "";

  if (digestStats.tier === DIGEST_TIERS.UNCLAIMED) {
    sections += sectionHeading("Visibility");
    sections += metricRow({
      label: "Listing appearances",
      value: formatCount(totals.impressions),
      description:
        "How often your shop showed up in directory results this week.",
    });
    sections += metricRow({
      label: "Listing page views",
      value: formatCount(totals.page_views),
      description:
        "How many times someone opened your business page from RadiatorRepairHub.",
    });
    if (digestStats.hasCallButtonInterest) {
      sections += sectionHeading("Customer interest");
      sections += callInterestCallout();
    }
    return wrapStatsSections(sections);
  }

  sections += sectionHeading("Visibility");
  sections += metricRow({
    label: "Page views",
    value: formatCount(totals.page_views),
    delta: formatDelta(comparisonTotals.page_views),
    description:
      "How many times someone opened your business page this week.",
  });
  sections += metricRow({
    label: "Impressions",
    value: formatCount(totals.impressions),
    delta: formatDelta(comparisonTotals.impressions),
    description:
      "How often your shop appeared in directory search and browsing results.",
  });

  if (digestStats.tier === DIGEST_TIERS.FEATURED) {
    sections += sectionHeading("Discovery performance");
    sections += metricRow({
      label: "Listing clicks",
      value: formatCount(totals.listing_clicks),
      description:
        "How many times someone clicked your listing card to open the full page.",
    });
    sections += metricRow({
      label: "Click-through rate",
      value: formatRate(digestStats.ctr),
      description:
        "Listing clicks divided by impressions — how often appearances turned into page visits.",
    });
    sections += metricRow({
      label: "Average position",
      value: formatPosition(digestStats.avgPosition),
      description:
        "Roughly where your listing ranked when it was shown in results (lower is better).",
    });

    sections += sectionHeading("Contact actions");
    sections += metricRow({
      label: "Phone clicks",
      value: formatCount(totals.phone_clicks),
      description:
        "How many times customers tapped your phone number on your business page.",
    });
    sections += metricRow({
      label: "Directions clicks",
      value: formatCount(totals.directions_clicks),
      description: "Taps on the directions button on your business page.",
    });
    sections += metricRow({
      label: "Website clicks",
      value: formatCount(totals.website_clicks),
      description: "Taps on the website button on your business page.",
    });
    sections += metricRow({
      label: "Email clicks",
      value: formatCount(totals.email_clicks),
      description: "Taps on the email button on your business page.",
    });
  } else if (digestStats.hasCallButtonInterest) {
    sections += sectionHeading("Customer interest");
    sections += callInterestCallout();
  }

  sections += sourceBreakdownHtml(digestStats.impressionsBySource);
  return wrapStatsSections(sections);
}

export function buildWeeklyDigestUnsubscribeUrl(businessId, email) {
  const token = signUnsubscribeToken({ businessId, email });
  return buildUnsubscribeUrl(token, getWebBaseUrl());
}

export function buildWeeklyDigestOneClickUnsubscribeUrl(businessId, email) {
  const token = signUnsubscribeToken({ businessId, email });
  return buildOneClickUnsubscribeUrl(token, getWebBaseUrl());
}

export function buildWeeklyDigestEmailContent(business, digestStats, recipient) {
  const businessName = business?.title ?? null;
  const webBase = getWebBaseUrl();
  const businessPageUrl = buildBusinessClaimLink(business?.slug);
  const claimUrl = businessPageUrl;
  const howToClaimUrl = `${webBase}/how-to-claim`;
  const featuredUrl = `${webBase}/pricing`;
  const dashboardUrl = `${webBase}/dashboard?tab=analytics`;
  const insightsUrl = `${webBase}/dashboard?tab=insights`;
  const unsubscribeUrl = buildWeeklyDigestUnsubscribeUrl(
    business.id,
    recipient
  );
  const oneClickUnsubscribeUrl = buildWeeklyDigestOneClickUnsubscribeUrl(
    business.id,
    recipient
  );
  const statsHtml = buildWeeklyDigestStatsHtml(digestStats);

  if (digestStats.tier === DIGEST_TIERS.UNCLAIMED) {
    return {
      subject: WEEKLY_DIGEST_UNCLAIMED_MESSAGE.subject(businessName),
      html: WEEKLY_DIGEST_UNCLAIMED_MESSAGE.html(businessName, {
        statsHtml,
        claimUrl,
        howToClaimUrl,
        unsubscribeUrl,
      }),
      unsubscribeUrl,
      oneClickUnsubscribeUrl,
    };
  }

  if (digestStats.tier === DIGEST_TIERS.FEATURED) {
    return {
      subject: WEEKLY_DIGEST_FEATURED_MESSAGE.subject(businessName),
      html: WEEKLY_DIGEST_FEATURED_MESSAGE.html(businessName, {
        statsHtml,
        dashboardUrl,
        insightsUrl,
        unsubscribeUrl,
      }),
      unsubscribeUrl,
      oneClickUnsubscribeUrl,
    };
  }

  return {
    subject: WEEKLY_DIGEST_CLAIMED_BASIC_MESSAGE.subject(businessName),
    html: WEEKLY_DIGEST_CLAIMED_BASIC_MESSAGE.html(businessName, {
      statsHtml,
      featuredUrl,
      dashboardUrl,
      unsubscribeUrl,
    }),
    unsubscribeUrl,
    oneClickUnsubscribeUrl,
  };
}

export function buildWeeklyDigestEmailPayload({
  business,
  digestStats,
  recipient,
  senderEmail,
}) {
  const content = buildWeeklyDigestEmailContent(
    business,
    digestStats,
    recipient
  );
  const deliveryTo = isOutreachDevRedirect()
    ? process.env.TEST_RECIPIENT_EMAIL
    : recipient;
  const subject = isOutreachDevRedirect()
    ? `[DEV] ${content.subject}`
    : content.subject;

  return {
    from: `${SENDER_NAME} <${senderEmail}>`,
    to: [deliveryTo],
    subject,
    html: content.html,
    headers: {
      "List-Unsubscribe": `<${content.oneClickUnsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
