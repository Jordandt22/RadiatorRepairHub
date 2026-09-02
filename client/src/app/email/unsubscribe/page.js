import { Suspense } from "react";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import UnsubscribePageContent from "@/components/email/UnsubscribePageContent";

export const metadata = {
  title: "Unsubscribe | RadiatorRepairHub",
  description: "Unsubscribe from weekly RadiatorRepairHub listing reports.",
  robots: NOINDEX_ROBOTS,
};

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-lg px-4 py-16 text-sm text-muted-foreground">
            Updating your email preferences…
          </div>
        }
      >
        <UnsubscribePageContent />
      </Suspense>
    </div>
  );
}
