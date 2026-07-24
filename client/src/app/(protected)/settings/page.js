import Link from "next/link";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Account Settings | RadiatorRepairHub",
  description: "Manage your RadiatorRepairHub business owner account settings.",
  robots: NOINDEX_ROBOTS,
};

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your business owner account. More settings are coming soon.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-6 text-gray-600">
          Account and listing management tools will appear here. For now you can
          review how claiming works or contact support.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/how-to-claim"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            How to claim
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
