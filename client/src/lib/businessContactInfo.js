/** Digits-only E.164-friendly national number from BUSINESS_PHONE. */
export function getBusinessPhoneDigits() {
  const raw = process.env.BUSINESS_PHONE;
  if (!raw || typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

export function getBusinessEmail() {
  const email = process.env.BUSINESS_EMAIL;
  if (!email || typeof email !== "string" || !email.trim()) return null;
  return email.trim();
}

/** Display like (408) 809-5718 for 10-digit US numbers. */
export function formatBusinessPhoneDisplay(digits = getBusinessPhoneDigits()) {
  if (!digits) return null;
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

export function getBusinessPhoneTelHref(digits = getBusinessPhoneDigits()) {
  if (!digits) return null;
  return `tel:+1${digits}`;
}

export function getBusinessPhoneSmsHref(digits = getBusinessPhoneDigits()) {
  if (!digits) return null;
  return `sms:+1${digits}`;
}

/** Schema.org telephone in E.164. */
export function getBusinessPhoneE164(digits = getBusinessPhoneDigits()) {
  if (!digits) return null;
  return `+1${digits}`;
}
