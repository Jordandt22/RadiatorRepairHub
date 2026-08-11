import { getBusinessEmail, getBusinessPhoneDigits } from "@/lib/businessContactInfo";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";

/** Compact email + phone block for legal / help pages. */
export default function SiteSupportContactLines({ className = "" }) {
  const email = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());

  if (!email && !hasPhone) return null;

  return (
    <div className={className}>
      {email ? (
        <p className="mt-4 text-gray-700">
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${email}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {email}
          </a>
        </p>
      ) : null}
      {hasPhone ? (
        <p className="mt-2 text-gray-700">
          <strong>Phone / SMS:</strong>{" "}
          <SitePhoneLinks className="inline" showLabel={false} />
        </p>
      ) : null}
    </div>
  );
}
