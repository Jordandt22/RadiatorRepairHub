"use client";

import { useEffect, useState } from "react";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import OwnedBusinessCard from "@/components/dashboard/OwnedBusinessCard";

const TABS = [{ id: "my-businesses", label: "My Businesses" }];

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState("my-businesses");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await fetchOwnedBusinesses();
      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message || "Failed to load businesses.");
        setBusinesses([]);
      } else {
        setBusinesses(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your claimed businesses and account.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4" aria-label="Dashboard sections">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "my-businesses" && (
        <section aria-labelledby="my-businesses-heading">
          <h2 id="my-businesses-heading" className="sr-only">
            My Businesses
          </h2>

          {loading && (
            <p className="text-sm text-gray-500">Loading your businesses…</p>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && businesses.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <p className="font-medium text-gray-900">No businesses yet</p>
              <p className="mt-1 text-sm text-gray-600">
                Claim a listing from a business page to see it here.
              </p>
            </div>
          )}

          {!loading && !error && businesses.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {businesses.map((business) => (
                <OwnedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
