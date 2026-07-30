import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import EmailConfirmedContent from "@/components/auth/EmailConfirmedContent";

export const metadata = {
  title: "Email Confirmed | RadiatorRepairHub",
  description:
    "Your email confirmation was received. Confirm both addresses to finish an email update.",
  robots: NOINDEX_ROBOTS,
};

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmailConfirmedContent />
    </div>
  );
}
