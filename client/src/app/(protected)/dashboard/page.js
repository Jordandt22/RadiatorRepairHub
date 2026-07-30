import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata = {
  title: "Business Dashboard | RadiatorRepairHub",
  description:
    "Manage your claimed radiator repair business listing on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default function DashboardPage() {
  return <DashboardContent />;
}
