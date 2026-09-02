export function normalizeNotificationEmail(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed || null;
}

export function resolveNotificationRecipient(business, ownerAuthEmail = null) {
  const listingEmail = normalizeNotificationEmail(business?.email);
  const notificationEmail = normalizeNotificationEmail(
    business?.notification_email
  );
  const authEmail = normalizeNotificationEmail(
    ownerAuthEmail ?? business?.owner_email
  );
  const isClaimed = Boolean(
    business?.is_claimed || business?.claim_eligibility === "claimed"
  );

  if (isClaimed) {
    return notificationEmail || authEmail || listingEmail || null;
  }

  return listingEmail || null;
}

export function resolveNotificationRecipientSource(
  business,
  ownerAuthEmail = null
) {
  const listingEmail = normalizeNotificationEmail(business?.email);
  const notificationEmail = normalizeNotificationEmail(
    business?.notification_email
  );
  const authEmail = normalizeNotificationEmail(
    ownerAuthEmail ?? business?.owner_email
  );
  const isClaimed = Boolean(
    business?.is_claimed || business?.claim_eligibility === "claimed"
  );

  if (isClaimed) {
    if (notificationEmail) {
      return { email: notificationEmail, source: "notification_email" };
    }
    if (authEmail) {
      return { email: authEmail, source: "account_email" };
    }
    if (listingEmail) {
      return { email: listingEmail, source: "listing_email" };
    }
    return { email: null, source: null };
  }

  return listingEmail
    ? { email: listingEmail, source: "listing_email" }
    : { email: null, source: null };
}
