import Link from "next/link";

/**
 * Policy links shown beside (not inside) TCPA call-consent checkboxes so the
 * consent statement stays clean while Terms / Privacy stay findable.
 */
export default function ClaimConsentPolicyLinks({ className = "" }) {
  return (
    <p className={`text-xs text-muted-foreground leading-relaxed ${className}`.trim()}>
      Phone verification is also subject to our{" "}
      <Link
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="text-interactive underline underline-offset-2 transition-colors hover:text-interactive/80"
        prefetch={false}
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-interactive underline underline-offset-2 transition-colors hover:text-interactive/80"
        prefetch={false}
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
