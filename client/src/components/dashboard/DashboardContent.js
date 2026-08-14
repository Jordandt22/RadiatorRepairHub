"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import OwnedBusinessCard from "@/components/dashboard/OwnedBusinessCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/contexts/ToastProvider";
import { signOut } from "@/lib/auth/session";

function DashboardContentInner() {
  const router = useRouter();
  const { showCustomSuccess } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError, status } = await fetchOwnedBusinesses();

    if (status === 401) {
      await signOut();
      router.replace("/signin?redirect=%2Fdashboard");
      return;
    }

    if (fetchError) {
      setError(fetchError.message || "Failed to load businesses.");
      setBusinesses([]);
    } else {
      setBusinesses(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await loadBusinesses();
      if (!mounted) return;
    }

    load();

    return () => {
      mounted = false;
    };
  }, [loadBusinesses]);

  const handleUnclaimed = async (result) => {
    if (result?.unauthorized) {
      await signOut();
      router.replace("/signin?redirect=%2Fdashboard");
      return;
    }

    if (result?.businessId) {
      setBusinesses((prev) =>
        prev.filter((business) => business.id !== result.businessId)
      );
    }

    if (result?.message) {
      showCustomSuccess(result.message);
    }
  };

  const tabsTriggerClassNames ="px-6 cursor-pointer transition-colors duration-200";
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your claimed businesses and account.
        </p>
      </div>

      <Tabs defaultValue="my-businesses" className="gap-6">
        <TabsList>
          <TabsTrigger
            value="my-businesses"
            className={tabsTriggerClassNames}
          >
            My Businesses
          </TabsTrigger>
          <TabsTrigger value="inbox" className={tabsTriggerClassNames}>
            Inbox
          </TabsTrigger>
          <TabsTrigger value="analytics" className={tabsTriggerClassNames}>
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-businesses">
          <section aria-labelledby="my-businesses-heading">
            <h2 id="my-businesses-heading" className="sr-only">
              My Businesses
            </h2>

            {loading && (
              <p className="text-sm text-muted-foreground">Loading your businesses…</p>
            )}

            {!loading && error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && businesses.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
                <p className="font-medium text-foreground">No businesses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Claim a listing from a business page to see it here.
                </p>
              </div>
            )}

            {!loading && !error && businesses.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {businesses.map((business) => (
                  <OwnedBusinessCard
                    key={business.id}
                    business={business}
                    onUnclaimed={handleUnclaimed}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="inbox">
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage Quick Contact inquiries from customers.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Track listing views and how customers find your business.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardContent() {
  return <DashboardContentInner />;
}
