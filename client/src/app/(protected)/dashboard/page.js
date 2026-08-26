import { Suspense } from "react";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata = {
  title: "Business Dashboard | RadiatorRepairHub",
  description:
    "Manage your claimed radiator repair business listing and view listing analytics on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
