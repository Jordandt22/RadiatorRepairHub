import { Suspense } from "react";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import SettingsContent from "@/components/settings/SettingsContent";

export const metadata = {
  title: "Account Settings | RadiatorRepairHub",
  description: "Manage your RadiatorRepairHub business owner account settings.",
  robots: NOINDEX_ROBOTS,
};

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
