"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/Auth.context";
import { useLoading } from "@/contexts/Loading.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import OutreachFilterTabs, {
  VALID_OUTREACH_TABS,
} from "@/components/pages/outreach/OutreachFilterTabs";
import OutreachBrowseActions from "@/components/pages/outreach/OutreachBrowseActions";
import OutreachSenderActions from "@/components/pages/outreach/OutreachSenderActions";
import OutreachHistoryActions from "@/components/pages/outreach/OutreachHistoryActions";
import OutreachTable from "@/components/pages/outreach/OutreachTable";
import OutreachTableSkeleton from "@/components/pages/outreach/OutreachTableSkeleton";
import OutreachHistoryTable from "@/components/pages/outreach/OutreachHistoryTable";
import OutreachHistoryTableSkeleton from "@/components/pages/outreach/OutreachHistoryTableSkeleton";
import OutreachPreviewSheet from "@/components/pages/outreach/OutreachPreviewSheet";
import OutreachAddBusinessesSheet from "@/components/pages/outreach/OutreachAddBusinessesSheet";
import Pagination from "@/components/pages/dashboard/Pagination";
import {
  OUTREACH_LIMIT_OPTIONS,
  OUTREACH_SEND_SELECTION_CAP,
  OUTREACH_TYPE_OPTIONS,
} from "@/components/pages/outreach/outreachConstants";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolveTab(tab) {
  return VALID_OUTREACH_TABS.includes(tab) ? tab : "all";
}

function parseSentFilter(item) {
  if (!item?.id) return null;
  if (item.id === "true") return true;
  if (item.id === "false") return false;
  return null;
}

export default function OutreachPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();

  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );

  // All tab state
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [claimEligibility, setClaimEligibility] = useState(null);
  const [websiteFilter, setWebsiteFilter] = useState(null);
  const [claimInviteSent, setClaimInviteSent] = useState(null);
  const [websiteOfferSent, setWebsiteOfferSent] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  // Sender tab state
  const [outreachType, setOutreachType] = useState(
    () => OUTREACH_TYPE_OPTIONS[0],
  );
  const [matchLimit, setMatchLimit] = useState(
    () => OUTREACH_LIMIT_OPTIONS[1],
  );
  const [matchedSet, setMatchedSet] = useState([]);
  const [manualSet, setManualSet] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  // History tab state
  const [historyPage, setHistoryPage] = useState(1);
  const [historyType, setHistoryType] = useState(null);
  const [historyRefreshError, setHistoryRefreshError] = useState(null);

  const searchQuery = debouncedSearch.trim();
  const claimEligibilityId = claimEligibility?.id ?? null;
  const websiteFilterId = websiteFilter?.id ?? null;
  const claimInviteSentValue = parseSentFilter(claimInviteSent);
  const websiteOfferSentValue = parseSentFilter(websiteOfferSent);
  const outreachTypeId = outreachType?.id ?? null;
  const matchLimitValue = matchLimit?.value ?? 25;
  const historyTypeId = historyType?.id ?? null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      window.history.replaceState(
        window.history.state,
        "",
        "/outreach?tab=all",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
    });
  }, []);

  useEffect(() => {
    const run = debounce((value) => {
      setDebouncedSearch(value);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    run(searchInput);
    return () => run.cancel();
  }, [searchInput]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/outreach");
    setActiveTab(nextTab);
  };

  const browseQueryKey = [
    "outreach-businesses",
    page,
    searchQuery,
    claimEligibilityId,
    websiteFilterId,
    claimInviteSentValue,
    websiteOfferSentValue,
  ];

  const browseQuery = useQuery({
    queryKey: browseQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (claimEligibilityId) {
        params.set("claim_eligibility", claimEligibilityId);
      }
      if (websiteFilterId) params.set("website_filter", websiteFilterId);
      if (claimInviteSentValue !== null) {
        params.set("claim_invite_sent", String(claimInviteSentValue));
      }
      if (websiteOfferSentValue !== null) {
        params.set("website_offer_sent", String(websiteOfferSentValue));
      }

      const result = await fetchApi(
        `/admin/outreach/businesses?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch outreach businesses",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && activeTab === "all",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const historyQueryKey = ["outreach-history", historyPage, historyTypeId];

  const historyQuery = useQuery({
    queryKey: historyQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(historyPage),
        limit: String(PAGE_LIMIT),
      });
      if (historyTypeId) params.set("outreach_type", historyTypeId);

      const result = await fetchApi(
        `/admin/outreach/history?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch outreach history",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && activeTab === "history",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const refreshBrowseMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outreach-businesses"] });
    },
    onMutate: () => {
      setRefreshError(null);
      setLoading(true);
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
    onSettled: () => setLoading(false),
  });

  const refreshHistoryMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outreach-history"] });
    },
    onMutate: () => {
      setHistoryRefreshError(null);
      setLoading(true);
    },
    onError: (err) => {
      setHistoryRefreshError(err.message || "Failed to refresh");
    },
    onSettled: () => setLoading(false),
  });

  const matchingMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/outreach/matching-ids", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          outreach_type: outreachTypeId,
          limit: matchLimitValue,
        }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to select matching businesses",
        );
      }
      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      setLoading(true);
    },
    onSuccess: (payload) => {
      const matched = payload?.businesses ?? [];
      const matchedIds = new Set(matched.map((row) => row.id));
      setMatchedSet(matched);
      setManualSet((prev) => {
        const filtered = prev.filter((row) => !matchedIds.has(row.id));
        const room = Math.max(
          0,
          OUTREACH_SEND_SELECTION_CAP - matched.length,
        );
        const nextManual = filtered.slice(0, room);
        const nextSelected = new Set(matched.map((row) => row.id));
        for (const row of nextManual) {
          if (nextSelected.size >= OUTREACH_SEND_SELECTION_CAP) break;
          nextSelected.add(row.id);
        }
        setSelectedIds(nextSelected);
        return nextManual;
      });
      if (matched.length === 0) {
        setActionError(
          "No eligible businesses matched for this campaign type.",
        );
      } else {
        setActionError(null);
      }
    },
    onError: (err) => {
      setActionError(err.message || "Failed to select matching businesses");
    },
    onSettled: () => setLoading(false),
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/outreach/preview", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          outreach_type: outreachTypeId,
          business_ids: Array.from(selectedIds),
        }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to preview emails");
      }
      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      setLoading(true);
    },
    onSuccess: (payload) => {
      setPreviewData(payload);
      setPreviewOpen(true);
    },
    onError: (err) => {
      setActionError(err.message || "Failed to preview emails");
    },
    onSettled: () => setLoading(false),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/outreach/send", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          outreach_type: outreachTypeId,
          business_ids: Array.from(selectedIds),
        }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to send emails");
      }
      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      setLoading(true);
    },
    onSuccess: async (payload) => {
      setPreviewOpen(false);
      setPreviewData(null);
      setMatchedSet([]);
      setManualSet([]);
      setSelectedIds(new Set());
      const sentCount = payload?.sent?.length ?? 0;
      const skippedCount = payload?.skipped?.length ?? 0;
      if (sentCount === 0 && skippedCount > 0) {
        setActionError(
          `Nothing sent. ${skippedCount} business${skippedCount === 1 ? "" : "es"} skipped.`,
        );
      } else {
        setActionError(null);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outreach-businesses"] }),
        queryClient.invalidateQueries({ queryKey: ["outreach-history"] }),
      ]);
    },
    onError: (err) => {
      setActionError(err.message || "Failed to send emails");
    },
    onSettled: () => setLoading(false),
  });

  const workingSetCount = matchedSet.length + manualSet.length;
  const existingIds = useMemo(() => {
    const ids = new Set();
    for (const row of matchedSet) ids.add(row.id);
    for (const row of manualSet) ids.add(row.id);
    return ids;
  }, [matchedSet, manualSet]);
  const remainingSlots = Math.max(
    0,
    OUTREACH_SEND_SELECTION_CAP - workingSetCount,
  );

  const handleToggleId = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= OUTREACH_SEND_SELECTION_CAP && !next.has(id)) {
          return prev;
        }
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleToggleSection = (rows, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!checked) {
        for (const row of rows) next.delete(row.id);
        return next;
      }
      for (const row of rows) {
        if (next.size >= OUTREACH_SEND_SELECTION_CAP) break;
        next.add(row.id);
      }
      return next;
    });
  };

  const clearWorkingSet = () => {
    setMatchedSet([]);
    setManualSet([]);
    setSelectedIds(new Set());
    setActionError(null);
  };

  const handleAddManual = (businesses) => {
    const toAdd = [];
    for (const business of businesses) {
      if (existingIds.has(business.id)) continue;
      if (
        matchedSet.length + manualSet.length + toAdd.length >=
        OUTREACH_SEND_SELECTION_CAP
      ) {
        break;
      }
      toAdd.push(business);
    }
    if (toAdd.length === 0) return;
    setManualSet((prev) => [...prev, ...toAdd]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const row of toAdd) {
        if (next.size >= OUTREACH_SEND_SELECTION_CAP) break;
        next.add(row.id);
      }
      return next;
    });
    setActionError(null);
  };

  const resetBrowsePage = () => setPage(1);

  const businesses = browseQuery.data?.businesses ?? [];
  const totalPages = browseQuery.data?.totalPages ?? 0;
  const hasBrowseFilters = Boolean(
    searchQuery ||
      claimEligibilityId ||
      websiteFilterId ||
      claimInviteSentValue !== null ||
      websiteOfferSentValue !== null,
  );

  const historyRows = historyQuery.data?.history ?? [];
  const historyTotalPages = historyQuery.data?.totalPages ?? 0;

  const outreachTypeLabel = useMemo(
    () => outreachType?.label ?? null,
    [outreachType],
  );

  const tabDescription = {
    all: "Browse businesses, claim eligibility, and outreach send status.",
    sender: `Match up to your chosen limit, then manually add more (total max ${OUTREACH_SEND_SELECTION_CAP}).`,
    history: "Review previously sent outreach emails.",
  }[activeTab];

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Outreach
        </h1>
        <p className="text-sm text-muted-foreground">{tabDescription}</p>
      </div>

      <OutreachFilterTabs value={activeTab} onValueChange={handleTabChange} />

      {activeTab === "all" ? (
        <>
          <OutreachBrowseActions
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            claimEligibility={claimEligibility}
            onClaimEligibilityChange={(value) => {
              setClaimEligibility(value);
              resetBrowsePage();
            }}
            websiteFilter={websiteFilter}
            onWebsiteFilterChange={(value) => {
              setWebsiteFilter(value);
              resetBrowsePage();
            }}
            claimInviteSent={claimInviteSent}
            onClaimInviteSentChange={(value) => {
              setClaimInviteSent(value);
              resetBrowsePage();
            }}
            websiteOfferSent={websiteOfferSent}
            onWebsiteOfferSentChange={(value) => {
              setWebsiteOfferSent(value);
              resetBrowsePage();
            }}
            onRefresh={() => refreshBrowseMutation.mutate()}
            refreshPending={
              refreshBrowseMutation.isPending || browseQuery.isFetching
            }
            refreshError={refreshError}
            listError={browseQuery.error?.message ?? null}
          />

          {browseQuery.isLoading && !browseQuery.data ? (
            <OutreachTableSkeleton />
          ) : (
            <OutreachTable
              businesses={businesses}
              selectable={false}
              hasFilters={hasBrowseFilters}
              emptyVariant="browse"
            />
          )}

          {totalPages > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              displayPage={page}
              total={browseQuery.data?.total}
              isFetching={
                browseQuery.isFetching || browseQuery.isPlaceholderData
              }
              onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => prev + 1)}
            />
          ) : null}
        </>
      ) : null}

      {activeTab === "sender" ? (
        <>
          <OutreachSenderActions
            outreachType={outreachType}
            onOutreachTypeChange={(value) => {
              setOutreachType(value);
              clearWorkingSet();
            }}
            matchLimit={matchLimit}
            onMatchLimitChange={setMatchLimit}
            selectedCount={selectedIds.size}
            workingSetCount={workingSetCount}
            onSelectMatching={() => matchingMutation.mutate()}
            selectMatchingPending={matchingMutation.isPending}
            onAddBusinesses={() => setAddOpen(true)}
            addDisabled={
              !outreachTypeId ||
              remainingSlots <= 0 ||
              matchingMutation.isPending
            }
            onClearSelection={clearWorkingSet}
            onPreviewSend={() => previewMutation.mutate()}
            previewDisabled={
              !outreachTypeId ||
              selectedIds.size === 0 ||
              previewMutation.isPending ||
              sendMutation.isPending
            }
            actionError={actionError}
          />

          {matchingMutation.isPending && workingSetCount === 0 ? (
            <OutreachTableSkeleton />
          ) : workingSetCount === 0 ? (
            <OutreachTable
              businesses={[]}
              selectable={false}
              hasFilters={Boolean(actionError)}
              emptyVariant="sender"
            />
          ) : (
            <div className="flex flex-col gap-6">
              <OutreachTable
                businesses={matchedSet}
                selectable
                selectedIds={selectedIds}
                onToggleId={handleToggleId}
                onTogglePage={(checked) =>
                  handleToggleSection(matchedSet, checked)
                }
                emptyVariant="sender"
                selectionCap={OUTREACH_SEND_SELECTION_CAP}
                sectionTitle="Matched"
                hideEmpty
              />
              <OutreachTable
                businesses={manualSet}
                selectable
                selectedIds={selectedIds}
                onToggleId={handleToggleId}
                onTogglePage={(checked) =>
                  handleToggleSection(manualSet, checked)
                }
                emptyVariant="sender"
                selectionCap={OUTREACH_SEND_SELECTION_CAP}
                sectionTitle="Manually added"
                hideEmpty
              />
            </div>
          )}
        </>
      ) : null}

      {activeTab === "history" ? (
        <>
          <OutreachHistoryActions
            outreachType={historyType}
            onOutreachTypeChange={(value) => {
              setHistoryType(value);
              setHistoryPage(1);
            }}
            onRefresh={() => refreshHistoryMutation.mutate()}
            refreshPending={
              refreshHistoryMutation.isPending || historyQuery.isFetching
            }
            refreshError={historyRefreshError}
            listError={historyQuery.error?.message ?? null}
          />

          {historyQuery.isLoading && !historyQuery.data ? (
            <OutreachHistoryTableSkeleton />
          ) : (
            <OutreachHistoryTable
              rows={historyRows}
              hasFilters={Boolean(historyTypeId)}
            />
          )}

          {historyTotalPages > 0 ? (
            <Pagination
              page={historyPage}
              totalPages={historyTotalPages}
              displayPage={historyPage}
              total={historyQuery.data?.total}
              isFetching={
                historyQuery.isFetching || historyQuery.isPlaceholderData
              }
              onPrevious={() =>
                setHistoryPage((prev) => Math.max(1, prev - 1))
              }
              onNext={() => setHistoryPage((prev) => prev + 1)}
            />
          ) : null}
        </>
      ) : null}

      <OutreachPreviewSheet
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setPreviewData(null);
        }}
        preview={previewData}
        outreachTypeLabel={outreachTypeLabel}
        sendPending={sendMutation.isPending}
        onConfirmSend={() => sendMutation.mutate()}
      />

      <OutreachAddBusinessesSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        accessToken={accessToken}
        logout={logout}
        outreachTypeId={outreachTypeId}
        outreachTypeLabel={outreachTypeLabel}
        existingIds={existingIds}
        remainingSlots={remainingSlots}
        onAdd={handleAddManual}
      />
    </div>
  );
}
