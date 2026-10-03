import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import ConfirmationResult from "@/components/auth/ConfirmationResult";

export const metadata = {
  title: "Email Confirmed | RadiatorRepairHub",
  description: "Your email confirmation was received.",
  robots: NOINDEX_ROBOTS,
};

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-background">
      <ConfirmationResult continueHref="/settings" continueLabel="Go to Settings">
        <p>
          For an email address update to finish, make sure you confirm from{" "}
          <span className="font-medium text-foreground">both</span> your old and
          new email inboxes. If you still have a confirmation link waiting, open
          it to complete the change.
        </p>
      </ConfirmationResult>
    </div>
  );
}
