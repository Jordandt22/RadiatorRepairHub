import { logger } from "../lib/logger.js";
import {
  getWebBaseUrl,
  OWNER_PARTNER_WEBSITE_INTAKE_REMINDER_MESSAGE,
  SENDER_NAME,
} from "../lib/constants/messages.js";
import { resolveNotificationRecipient } from "../lib/notificationRecipient.js";
import { resendClient } from "../resend/resend.js";
import { adminAuthClient, supabase } from "../supabase/supabase.js";

async function ownerEmailForBusiness(business) {
  let accountEmail = null;
  if (business.owner_uid) {
    try {
      const { data, error } = await adminAuthClient.getUserById(
        business.owner_uid
      );
      if (!error && data?.user?.email) {
        accountEmail = data.user.email;
      }
    } catch {
      // leave unresolved
    }
  }
  return resolveNotificationRecipient(business, accountEmail);
}

async function sendReminderEmail({ to, businessTitle, businessId }) {
  const { SENDER_EMAIL, RESEND_API_KEY, TEST_RECIPIENT_EMAIL } = process.env;
  const isDev = process.env.NODE_ENV === "development";
  if (!RESEND_API_KEY || !SENDER_EMAIL) return { sent: false, reason: "config" };
  if (isDev && !TEST_RECIPIENT_EMAIL) {
    return { sent: false, reason: "dev_no_recipient" };
  }

  const baseUrl = getWebBaseUrl();
  const websiteDashboardPath = `/dashboard?tab=website&business=${encodeURIComponent(businessId)}`;
  const signInUrl = `${baseUrl}/signin?redirect=${encodeURIComponent(websiteDashboardPath)}`;
  const recipient = isDev ? TEST_RECIPIENT_EMAIL : to;

  const { error } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [recipient],
    subject: OWNER_PARTNER_WEBSITE_INTAKE_REMINDER_MESSAGE.subject(businessTitle),
    html: OWNER_PARTNER_WEBSITE_INTAKE_REMINDER_MESSAGE.html(businessTitle, {
      signInUrl,
    }),
  });

  if (error) throw error;
  return { sent: true };
}

export async function processPartnerIntakeReminderJob() {
  const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  const { data: intakes, error } = await supabase
    .from("partner_website_intakes")
    .select(
      "business_id, started_at, businesses!inner(id, title, email, notification_email, is_claimed, is_partner, owner_uid)"
    )
    .eq("status", "needs_info")
    .is("reminder_2d_sent_at", null)
    .lte("started_at", cutoff)
    .eq("businesses.is_partner", true);

  if (error) {
    throw error;
  }

  let sent = 0;
  let skipped = 0;
  const rows = intakes ?? [];

  for (const row of rows) {
    const business = Array.isArray(row.businesses)
      ? row.businesses[0]
      : row.businesses;
    if (!business?.is_partner) {
      skipped += 1;
      continue;
    }

    const to = await ownerEmailForBusiness(business);
    if (!to) {
      logger.warn(
        { businessId: row.business_id },
        "Partner intake reminder skipped: no owner email"
      );
      skipped += 1;
      continue;
    }

    try {
      const result = await sendReminderEmail({
        to,
        businessTitle: business.title,
        businessId: business.id,
      });
      if (!result.sent) {
        skipped += 1;
        continue;
      }

      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("partner_website_intakes")
        .update({ reminder_2d_sent_at: now, updated_at: now })
        .eq("business_id", row.business_id)
        .eq("status", "needs_info")
        .is("reminder_2d_sent_at", null);

      if (updateError) {
        logger.error(
          { err: updateError, businessId: row.business_id },
          "Failed to mark Partner intake reminder sent"
        );
        continue;
      }
      sent += 1;
    } catch (err) {
      logger.error(
        { err, businessId: row.business_id },
        "Failed to send Partner intake day-2 reminder"
      );
    }
  }

  return { scanned: rows.length, sent, skipped };
}
