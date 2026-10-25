import { Suspense } from "react";
import PartnerSitesPageContent from "@/components/pages/partner-sites/PartnerSitesPageContent";

export default function PartnerSitesPage() {
  return (
    <Suspense fallback={null}>
      <PartnerSitesPageContent />
    </Suspense>
  );
}
