import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import ConfirmationResult from "@/components/auth/ConfirmationResult";

export const metadata = {
  title: "Email Confirmed | RadiatorRepairHub",
  description: "Your account email confirmation was received.",
  robots: NOINDEX_ROBOTS,
};

export default function AccountConfirmedPage() {
  return (
    <div className="min-h-screen bg-background">
      <ConfirmationResult continueHref="/signin" continueLabel="Sign in">
        <p>
          Your account email is confirmed. Sign in with the password you
          created to manage your listing.
        </p>
      </ConfirmationResult>
    </div>
  );
}
