import {
  formatBusinessPhoneDisplay,
  getBusinessPhoneDigits,
  getBusinessPhoneSmsHref,
} from "@/lib/businessContactInfo";

/**
 * Text-only (SMS) link for RadiatorRepairHub support phone.
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
  const smsHref = getBusinessPhoneSmsHref(digits);

  return (
    <span className={className}>
      {showLabel ? (
        <span className="mb-1 block text-sm text-muted-foreground">
          Text only
        </span>
      ) : null}
      <a href={smsHref} className={linkClassName}>
        {display}
      </a>
    </span>
  );
}
