import { Suspense } from "react";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import EmailConfirmedContent from "@/components/auth/EmailConfirmedContent";

export const metadata = {
  title: "Email Confirmed | RadiatorRepairHub",
  description: "Your email confirmation was received.",
  robots: NOINDEX_ROBOTS,
};

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-16 text-sm text-muted-foreground">
            Loading...
          </div>
        }
      >
        <EmailConfirmedContent />
      </Suspense>
    </div>
  );
}
