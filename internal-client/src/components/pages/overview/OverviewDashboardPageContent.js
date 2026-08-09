"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardFilterTabs, {
  VALID_DASHBOARD_TABS,
} from "@/components/pages/overview/DashboardFilterTabs";
import OverviewContactMessagesTable from "@/components/pages/overview/OverviewContactMessagesTable";
import OverviewClaimRequestsTable from "@/components/pages/overview/OverviewClaimRequestsTable";
import OverviewListingReportsTable from "@/components/pages/overview/OverviewListingReportsTable";
import OverviewInquiriesTable from "@/components/pages/overview/OverviewInquiriesTable";
import OverviewListingRequestsTable from "@/components/pages/overview/OverviewListingRequestsTable";
import OverviewDashboardCharts, {
  OverviewDashboardChartsSkeleton,
} from "@/components/pages/overview/OverviewDashboardCharts";
import OverviewSystemsPanel from "@/components/pages/overview/OverviewSystemsPanel";
import ContactMessagesTableSkeleton from "@/components/pages/dashboard/ContactMessagesTableSkeleton";
import ClaimRequestsTableSkeleton from "@/components/pages/claim-requests/ClaimRequestsTableSkeleton";
import ListingReportsTableSkeleton from "@/components/pages/listing-reports/ListingReportsTableSkeleton";
import InquiriesTableSkeleton from "@/components/pages/inquiries/InquiriesTableSkeleton";
import ListingRequestsTableSkeleton from "@/components/pages/get-listed-requests/ListingRequestsTableSkeleton";

const PAGE_LIMIT = 10;

function resolveTab(tab) {
  return VALID_DASHBOARD_TABS.includes(tab) ? tab : "inbox";
}

function RefreshButton({ onClick, pending, className }) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={onClick}
      aria-label="Refresh"
      className={cn(
        "shrink-0 cursor-pointer rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-100 max-md:size-10 max-md:p-0 max-md:[&_svg]:size-5 md:px-6",
        className,
      )}
    >
      <RefreshCwIcon className={pending ? "animate-spin" : undefined} />
      <span className="hidden md:inline">Refresh</span>
    </Button>
  );
}

export default function OverviewDashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [contactRefreshError, setContactRefreshError] = useState(null);
  const [claimsRefreshError, setClaimsRefreshError] = useState(null);
  const [reportsRefreshError, setReportsRefreshError] = useState(null);
  const [inquiriesRefreshError, setInquiriesRefreshError] = useState(null);
  const [listingRequestsRefreshError, setListingRequestsRefreshError] =
    useState(null);
  const [statsRefreshError, setStatsRefreshError] = useState(null);

  const inboxEnabled = activeTab === "inbox";
  const analyticsEnabled = activeTab === "analytics";
  const systemsEnabled = activeTab === "systems";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "inbox", "/dashboard");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
    });
  }, []);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/dashboard");
  };

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const result = await fetchApi("/admin/dashboard/stats", { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch dashboard stats",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken && analyticsEnabled),
    staleTime: 30_000,
  });

  const contactQuery = useQuery({
    queryKey: ["dashboard-contact-messages"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
        archived: "false",
      });

      const result = await fetchApi(
        `/admin/contact-messages?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch messages");
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken && inboxEnabled),
    staleTime: 30_000,
  });

  const claimsQuery = useQuery({
    queryKey: ["dashboard-claim-requests"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
      });

      const result = await fetchApi(
        `/admin/claim-requests?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch claim requests",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken && inboxEnabled),
    staleTime: 30_000,
  });

  const reportsQuery = useQuery({
    queryKey: ["dashboard-listing-reports"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
      });

      const result = await fetchApi(
        `/admin/listing-reports?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch listing reports",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken && inboxEnabled),
    staleTime: 30_000,
  });

  const inquiriesQuery = useQuery({
    queryKey: ["dashboard-contact-inquiries"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
      });

      const result = await fetchApi(
        `/admin/contact-inquiries?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch contact inquiries",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken && inboxEnabled),
    staleTime: 30_000,
  });

  const listingRequestsQuery = useQuery({
    queryKey: ["dashboard-listing-requests"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_LIMIT),
      });

      const result = await fetchApi(
        `/admin/listing-requests?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch listing requests",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken && inboxEnabled),
    staleTime: 30_000,
  });

  const statsRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "dashboard" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setStatsRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
    onError: (err) => {
      setStatsRefreshError(err.message || "Failed to refresh");
    },
  });

  const contactRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "contact-messages" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setContactRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-contact-messages"],
      });
    },
    onError: (err) => {
      setContactRefreshError(err.message || "Failed to refresh");
    },
  });

  const claimsRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "claim-requests" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setClaimsRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-claim-requests"],
      });
    },
    onError: (err) => {
      setClaimsRefreshError(err.message || "Failed to refresh");
    },
  });

  const reportsRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "listing-reports" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setReportsRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-listing-reports"],
      });
    },
    onError: (err) => {
      setReportsRefreshError(err.message || "Failed to refresh");
    },
  });

  const inquiriesRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "contact-inquiries" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setInquiriesRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-contact-inquiries"],
      });
    },
    onError: (err) => {
      setInquiriesRefreshError(err.message || "Failed to refresh");
    },
  });

  const listingRequestsRefreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "listing-requests" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        throw new Error(
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache",
        );
      }

      return result.data;
    },
    onMutate: () => setListingRequestsRefreshError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dashboard-listing-requests"],
      });
    },
    onError: (err) => {
      setListingRequestsRefreshError(err.message || "Failed to refresh");
    },
  });

  if (!isReady || !accessToken) {
    return null;
  }

  const statsRefreshPending =
    statsRefreshMutation.isPending || statsQuery.isFetching;
  const contactRefreshPending =
    contactRefreshMutation.isPending || contactQuery.isFetching;
  const claimsRefreshPending =
    claimsRefreshMutation.isPending || claimsQuery.isFetching;
  const reportsRefreshPending =
    reportsRefreshMutation.isPending || reportsQuery.isFetching;
  const inquiriesRefreshPending =
    inquiriesRefreshMutation.isPending || inquiriesQuery.isFetching;
  const listingRequestsRefreshPending =
    listingRequestsRefreshMutation.isPending || listingRequestsQuery.isFetching;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <DashboardFilterTabs
          value={activeTab}
          onValueChange={handleTabChange}
        />

        {activeTab === "analytics" ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Analytics
                </h2>
                <p className="text-sm text-muted-foreground">
                  Business coverage and outreach email volume
                </p>
              </div>
              <RefreshButton
                onClick={() => statsRefreshMutation.mutate()}
                pending={statsRefreshPending}
              />
            </div>
            {statsRefreshError ? (
              <p className="text-sm text-destructive">{statsRefreshError}</p>
            ) : null}
            {statsQuery.error && !statsQuery.isFetching ? (
              <p className="text-sm text-destructive">
                {statsQuery.error.message}
              </p>
            ) : null}
            {statsQuery.isLoading ? (
              <OverviewDashboardChartsSkeleton />
            ) : !statsQuery.error ? (
              <OverviewDashboardCharts stats={statsQuery.data} />
            ) : null}
          </section>
        ) : null}

        {activeTab === "inbox" ? (
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Contact Form
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Latest messages across all statuses
                  </p>
                </div>
                <RefreshButton
                  onClick={() => contactRefreshMutation.mutate()}
                  pending={contactRefreshPending}
                />
              </div>
              {contactRefreshError ? (
                <p className="text-sm text-destructive">{contactRefreshError}</p>
              ) : null}
              {contactQuery.error && !contactQuery.isFetching ? (
                <p className="text-sm text-destructive">
                  {contactQuery.error.message}
                </p>
              ) : null}
              {contactQuery.isLoading ? (
                <ContactMessagesTableSkeleton rows={5} />
              ) : !contactQuery.error ? (
                <OverviewContactMessagesTable
                  messages={contactQuery.data?.contactMessages ?? []}
                />
              ) : null}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Claim Requests
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Latest claims across all statuses
                  </p>
                </div>
                <RefreshButton
                  onClick={() => claimsRefreshMutation.mutate()}
                  pending={claimsRefreshPending}
                />
              </div>
              {claimsRefreshError ? (
                <p className="text-sm text-destructive">{claimsRefreshError}</p>
              ) : null}
              {claimsQuery.error && !claimsQuery.isFetching ? (
                <p className="text-sm text-destructive">
                  {claimsQuery.error.message}
                </p>
              ) : null}
              {claimsQuery.isLoading ? (
                <ClaimRequestsTableSkeleton rows={5} />
              ) : !claimsQuery.error ? (
                <OverviewClaimRequestsTable
                  claimRequests={claimsQuery.data?.claimRequests ?? []}
                />
              ) : null}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Listing Reports
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Latest reports across all statuses
                  </p>
                </div>
                <RefreshButton
                  onClick={() => reportsRefreshMutation.mutate()}
                  pending={reportsRefreshPending}
                />
              </div>
              {reportsRefreshError ? (
                <p className="text-sm text-destructive">{reportsRefreshError}</p>
              ) : null}
              {reportsQuery.error && !reportsQuery.isFetching ? (
                <p className="text-sm text-destructive">
                  {reportsQuery.error.message}
                </p>
              ) : null}
              {reportsQuery.isLoading ? (
                <ListingReportsTableSkeleton rows={5} />
              ) : !reportsQuery.error ? (
                <OverviewListingReportsTable
                  listingReports={reportsQuery.data?.listingReports ?? []}
                />
              ) : null}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Inquiries
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Latest Contact page messages across all statuses
                  </p>
                </div>
                <RefreshButton
                  onClick={() => inquiriesRefreshMutation.mutate()}
                  pending={inquiriesRefreshPending}
                />
              </div>
              {inquiriesRefreshError ? (
                <p className="text-sm text-destructive">
                  {inquiriesRefreshError}
                </p>
              ) : null}
              {inquiriesQuery.error && !inquiriesQuery.isFetching ? (
                <p className="text-sm text-destructive">
                  {inquiriesQuery.error.message}
                </p>
              ) : null}
              {inquiriesQuery.isLoading ? (
                <InquiriesTableSkeleton rows={5} />
              ) : !inquiriesQuery.error ? (
                <OverviewInquiriesTable
                  contactInquiries={
                    inquiriesQuery.data?.contactInquiries ?? []
                  }
                />
              ) : null}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Get Listed
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Latest listing requests across all statuses
                  </p>
                </div>
                <RefreshButton
                  onClick={() => listingRequestsRefreshMutation.mutate()}
                  pending={listingRequestsRefreshPending}
                />
              </div>
              {listingRequestsRefreshError ? (
                <p className="text-sm text-destructive">
                  {listingRequestsRefreshError}
                </p>
              ) : null}
              {listingRequestsQuery.error &&
              !listingRequestsQuery.isFetching ? (
                <p className="text-sm text-destructive">
                  {listingRequestsQuery.error.message}
                </p>
              ) : null}
              {listingRequestsQuery.isLoading ? (
                <ListingRequestsTableSkeleton rows={5} />
              ) : !listingRequestsQuery.error ? (
                <OverviewListingRequestsTable
                  listingRequests={
                    listingRequestsQuery.data?.listingRequests ?? []
                  }
                />
              ) : null}
            </section>
          </div>
        ) : null}

        {activeTab === "systems" ? (
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Systems</h2>
              <p className="text-sm text-muted-foreground">
                Health checks for cache, database, and the public site
              </p>
            </div>
            <OverviewSystemsPanel enabled={systemsEnabled} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
