"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchOwnedBusinesses } from "@/lib/api/ownedBusinesses";
import OwnedBusinessCard from "@/components/dashboard/OwnedBusinessCard";
import BusinessAnalyticsPanel from "@/components/dashboard/BusinessAnalyticsPanel";
import BusinessInsightsPanel from "@/components/dashboard/BusinessInsightsPanel";
import AutomationPanel from "@/components/dashboard/AutomationPanel";
import WebsitePanel from "@/components/dashboard/WebsitePanel";
import { SelectMenu } from "@/components/ui/select-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastProvider";
import { signOut } from "@/lib/auth/session";
import { useQueryTab } from "@/lib/navigation/useQueryTab";
import { cn } from "@/lib/utils";

function DashboardContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showCustomSuccess } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, onTabChange] = useQueryTab(
    ["analytics", "insights", "automation", "website"],
    "my-businesses"
  );

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
  const dashboardTabs = [
    { value: "my-businesses", label: "My Businesses" },
    { value: "analytics", label: "Analytics" },
    { value: "insights", label: "Insights" },
    { value: "automation", label: "Automations" },
    { value: "website", label: "Website" },
  ];
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your claimed businesses and account.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="min-w-0 w-full gap-6"
      >
        <SelectMenu
          className="w-full sm:hidden"
          triggerClassName="w-full"
          aria-label="Dashboard section"
          value={activeTab}
          onValueChange={onTabChange}
          options={dashboardTabs}
        />
        <TabsList className="hidden sm:inline-flex">
          {dashboardTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={tabsTriggerClassNames}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="my-businesses" className="min-w-0">
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
                  Search for your shop and claim it from the listing page to
                  see it here.
                </p>
                <Link
                  href="/search"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-4 inline-flex",
                  )}
                >
                  Search businesses
                </Link>
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

        <TabsContent value="analytics" className="min-w-0">
          <BusinessAnalyticsPanel
            businesses={businesses}
            initialBusinessId={searchParams.get("business") || ""}
          />
        </TabsContent>

        <TabsContent value="insights" className="min-w-0">
          <BusinessInsightsPanel
            businesses={businesses}
            initialBusinessId={searchParams.get("business") || ""}
          />
        </TabsContent>

        <TabsContent value="automation" className="min-w-0">
          <AutomationPanel
            businesses={businesses}
            initialBusinessId={searchParams.get("business") || ""}
          />
        </TabsContent>

        <TabsContent value="website" className="min-w-0">
          <WebsitePanel
            businesses={businesses}
            initialBusinessId={searchParams.get("business") || ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardContent() {
  return <DashboardContentInner />;
}
