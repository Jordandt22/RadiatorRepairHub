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
  linkClassName = "text-blue-600 hover:text-blue-700 transition-colors",
}) {
  const digits = getBusinessPhoneDigits();
  if (!digits) return null;

  const display = formatBusinessPhoneDisplay(digits);
  const telHref = getBusinessPhoneTelHref(digits);
  const smsHref = getBusinessPhoneSmsHref(digits);

  return (
    <span className={className}>
      {showLabel ? (
        <span className="block text-gray-600 text-sm mb-1">
          Call or text (SMS)
        </span>
      ) : null}
      <a href={telHref} className={linkClassName}>
        {display}
      </a>
      <span className="text-gray-400 mx-1.5" aria-hidden="true">
        ·
      </span>
      <a href={smsHref} className={linkClassName}>
        Text Us
      </a>
    </span>
  );
}
