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
        <p className="mt-4 text-foreground">
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${email}`}
            className="text-interactive underline transition-colors hover:text-interactive/80"
          >
            {email}
          </a>
        </p>
      ) : null}
      {hasPhone ? (
        <p className="mt-2 text-foreground">
          <strong>Text only:</strong>{" "}
          <SitePhoneLinks className="inline" showLabel={false} />
        </p>
      ) : null}
    </div>
  );
}
