import {
  formatBusinessPhoneDisplay,
  getBusinessPhoneDigits,
  getBusinessPhoneSmsHref,
  getBusinessPhoneTelHref,
} from "@/lib/businessContactInfo";

/**
 * Call + Text links for RadiatorRepairHub support phone.
 * Renders nothing if BUSINESS_PHONE is unset.
 */
export default function SitePhoneLinks({
  className = "",
  showLabel = true,
  linkClassName = "text-interactive transition-colors hover:text-interactive/80",
}) {
  const digits = getBusinessPhoneDigits();
  if (!digits) return null;

  const display = formatBusinessPhoneDisplay(digits);
  const telHref = getBusinessPhoneTelHref(digits);
  const smsHref = getBusinessPhoneSmsHref(digits);

  return (
    <span className={className}>
      {showLabel ? (
        <span className="mb-1 block text-sm text-muted-foreground">
          Call or text (SMS)
        </span>
      ) : null}
      <a href={telHref} className={linkClassName}>
        {display}
      </a>
      <span className="mx-1.5 text-muted-foreground" aria-hidden="true">
        ·
      </span>
      <a href={smsHref} className={linkClassName}>
        Text Us
      </a>
    </span>
  );
}
