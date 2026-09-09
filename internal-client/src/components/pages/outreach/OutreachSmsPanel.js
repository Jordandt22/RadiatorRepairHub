"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import Pagination from "@/components/pages/dashboard/Pagination";
import OutreachSmsComposer from "@/components/pages/outreach/OutreachSmsComposer";
import OutreachSmsQueueTable from "@/components/pages/outreach/OutreachSmsQueueTable";
import {
  OUTREACH_SMS_BODY_MAX,
  OUTREACH_SMS_TYPE_OPTIONS,
  SENT_FILTERS,
  SMS_DECLINED_FILTERS,
  SMS_ELIGIBILITY_FILTERS,
} from "@/components/pages/outreach/outreachConstants";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Campaign defaults so the queue only surfaces businesses that can actually be
 * recorded: invites go to shops with no SMS invite, follow-ups to shops that
 * already got one. Declined shops are hidden unless the declined filter is on.
 */
function defaultSentFilters(outreachTypeId) {
  if (outreachTypeId === "sms_claim_followup") {
    return { inviteSent: true, followupSent: false };
  }
  return { inviteSent: false, followupSent: null };
}

function parseSentFilter(item) {
  if (!item?.id) return null;
  if (item.id === "true") return true;
  if (item.id === "false") return false;
  return null;
}

export default function OutreachSmsPanel({ accessToken, isReady, logout }) {
  const queryClient = useQueryClient();

  const [outreachType, setOutreachType] = useState(
    OUTREACH_SMS_TYPE_OPTIONS[0],
  );
  const [eligibility, setEligibility] = useState(SMS_ELIGIBILITY_FILTERS[0]);
  const [sentOverride, setSentOverride] = useState(null);
  const [declinedFilter, setDeclinedFilter] = useState(
    SMS_DECLINED_FILTERS[0],
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [body, setBody] = useState("");
  const [bodyEdited, setBodyEdited] = useState(false);
  const [actionError, setActionError] = useState(null);

  const outreachTypeId = outreachType?.id ?? "sms_claim_invite";
  const eligibilityId = eligibility?.id ?? "phone_able";
  const sentOverrideValue = parseSentFilter(sentOverride);
  const declinedValue = parseSentFilter(declinedFilter) ?? false;
  const defaults = defaultSentFilters(outreachTypeId);
  const inviteSent =
    sentOverrideValue === null ? defaults.inviteSent : sentOverrideValue;
  const followupSent = sentOverrideValue === null ? defaults.followupSent : null;

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value.trim());
        setPage(1);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  const queueQuery = useQuery({
    queryKey: [
      "outreach-sms-queue",
      page,
      searchQuery,
      eligibilityId,
      inviteSent,
      followupSent,
      declinedValue,
    ],
    enabled: isReady && Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        claim_eligibility: eligibilityId,
        sms_declined: String(declinedValue),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (inviteSent !== null) {
        params.set("sms_claim_invite_sent", String(inviteSent));
      }
      if (followupSent !== null) {
        params.set("sms_claim_followup_sent", String(followupSent));
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
          result.error.message || "Failed to fetch businesses to text",
        );
      }
      return result.data;
    },
  });

  const businesses = useMemo(
    () => queueQuery.data?.businesses ?? [],
    [queueQuery.data],
  );
  const totalPages = queueQuery.data?.totalPages ?? 0;

  const selectedBusiness = useMemo(
    () => businesses.find((row) => row.id === selectedId) ?? null,
    [businesses, selectedId],
  );

  useEffect(() => {
    if (selectedId && !businesses.some((row) => row.id === selectedId)) {
      setSelectedId(null);
    }
  }, [businesses, selectedId]);

  const previewQuery = useQuery({
    queryKey: ["outreach-sms-preview", selectedId, outreachTypeId],
    enabled: isReady && Boolean(accessToken) && Boolean(selectedId),
    staleTime: 30_000,
    queryFn: async () => {
      const result = await fetchApi("/admin/outreach/sms-preview", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          outreach_type: outreachTypeId,
          business_id: selectedId,
        }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to build the message");
      }
      return result.data;
    },
  });

  const previewBody = previewQuery.data?.body ?? "";
  const previewBusinessId = previewQuery.data?.business_id ?? null;

  // Keep manual edits, but reset whenever a different business or campaign loads.
  useEffect(() => {
    if (!previewBody || previewBusinessId !== selectedId) return;
    if (bodyEdited) return;
    setBody(previewBody);
  }, [previewBody, previewBusinessId, selectedId, bodyEdited]);

  const advanceRef = useRef(null);

  const selectBusiness = (row) => {
    setSelectedId(row?.id ?? null);
    setBody("");
    setBodyEdited(false);
    setActionError(null);
  };

  const nextBusinessAfter = (id) => {
    const index = businesses.findIndex((row) => row.id === id);
    if (index === -1) return null;
    return businesses[index + 1] ?? null;
  };

  const markSentMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/outreach/mark-sms-sent", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          outreach_type: outreachTypeId,
          business_ids: [selectedId],
          body: body.trim() || null,
        }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to mark as sent");
      }
      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      advanceRef.current = nextBusinessAfter(selectedId);
    },
    onSuccess: async (payload) => {
      const markedCount = payload?.marked?.length ?? 0;
      if (markedCount === 0) {
        const reason = payload?.skipped?.[0]?.reason ?? null;
        setActionError(
          reason
            ? `Nothing marked (${reason.replaceAll("_", " ")}).`
            : "Nothing marked.",
        );
        return;
      }
      selectBusiness(advanceRef.current);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outreach-sms-queue"] }),
        queryClient.invalidateQueries({ queryKey: ["outreach-businesses"] }),
        queryClient.invalidateQueries({ queryKey: ["outreach-history"] }),
      ]);
    },
    onError: (err) => {
      setActionError(err.message || "Failed to mark as sent");
    },
  });

  const markDeclinedMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/outreach/mark-sms-declined", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          business_ids: [selectedId],
        }),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to mark declined");
      }
      return result.data;
    },
    onMutate: () => {
      setActionError(null);
      advanceRef.current = nextBusinessAfter(selectedId);
    },
    onSuccess: async (payload) => {
      const markedCount = payload?.marked?.length ?? 0;
      if (markedCount === 0) {
        const reason = payload?.skipped?.[0]?.reason ?? null;
        setActionError(
          reason
            ? `Nothing marked (${reason.replaceAll("_", " ")}).`
            : "Nothing marked.",
        );
        return;
      }
      selectBusiness(advanceRef.current);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outreach-sms-queue"] }),
        queryClient.invalidateQueries({ queryKey: ["outreach-businesses"] }),
        queryClient.invalidateQueries({ queryKey: ["outreach-history"] }),
      ]);
    },
    onError: (err) => {
      setActionError(err.message || "Failed to mark declined");
    },
  });

  const handleSkip = () => {
    selectBusiness(nextBusinessAfter(selectedId));
  };

  const hasFilters =
    Boolean(searchQuery) ||
    sentOverrideValue !== null ||
    declinedValue !== false;
  const actionPending =
    markSentMutation.isPending || markDeclinedMutation.isPending;
  const markSentDisabled =
    !selectedId ||
    previewQuery.isLoading ||
    previewQuery.data?.eligible !== true ||
    body.trim().length > OUTREACH_SMS_BODY_MAX ||
    actionPending;
  const markDeclinedDisabled =
    !selectedId ||
    Boolean(selectedBusiness?.sms_declined_at) ||
    Boolean(previewQuery.data?.sms_declined_at) ||
    actionPending;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid min-w-[10rem] gap-1.5">
            <Label htmlFor="rrh-outreach-sms-type">Campaign</Label>
            <BusinessTierCombobox
              items={OUTREACH_SMS_TYPE_OPTIONS}
              value={outreachType}
              onValueChange={(value) => {
                setOutreachType(value ?? OUTREACH_SMS_TYPE_OPTIONS[0]);
                setSentOverride(null);
                setPage(1);
                selectBusiness(null);
              }}
              placeholder="Claim invite"
              ariaLabel="SMS campaign type"
              inputName="rrh-outreach-sms-type"
            />
          </div>
          <div className="grid min-w-[10rem] gap-1.5">
            <Label htmlFor="rrh-outreach-sms-eligibility">Eligibility</Label>
            <BusinessTierCombobox
              items={SMS_ELIGIBILITY_FILTERS}
              value={eligibility}
              onValueChange={(value) => {
                setEligibility(value ?? SMS_ELIGIBILITY_FILTERS[0]);
                setPage(1);
                selectBusiness(null);
              }}
              placeholder="Phone able"
              ariaLabel="Filter by claim eligibility"
              inputName="rrh-outreach-sms-eligibility"
            />
          </div>
          <div className="grid min-w-[10rem] gap-1.5">
            <Label htmlFor="rrh-outreach-sms-sent">Invite texted</Label>
            <BusinessTierCombobox
              items={SENT_FILTERS}
              value={sentOverride}
              onValueChange={(value) => {
                setSentOverride(value);
                setPage(1);
                selectBusiness(null);
              }}
              placeholder="Campaign default"
              ariaLabel="Filter by SMS invite sent"
              inputName="rrh-outreach-sms-sent"
            />
          </div>
          <div className="grid min-w-[10rem] gap-1.5">
            <Label htmlFor="rrh-outreach-sms-declined">Declined</Label>
            <BusinessTierCombobox
              items={SMS_DECLINED_FILTERS}
              value={declinedFilter}
              onValueChange={(value) => {
                setDeclinedFilter(value ?? SMS_DECLINED_FILTERS[0]);
                setPage(1);
                selectBusiness(null);
              }}
              placeholder="Not declined"
              ariaLabel="Filter by SMS declined"
              inputName="rrh-outreach-sms-declined"
            />
          </div>
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                debouncedSetSearch(event.target.value);
              }}
              placeholder="Search title, slug, phone…"
              aria-label="Search businesses to text"
              name="rrh-outreach-sms-search"
              autoComplete="off"
              className="rounded-full pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queueQuery.refetch()}
            disabled={queueQuery.isFetching}
            aria-label="Refresh"
            className="shrink-0 cursor-pointer rounded-full md:ml-auto md:px-6"
          >
            <RefreshCwIcon
              className={queueQuery.isFetching ? "animate-spin" : undefined}
            />
            <span className="hidden md:inline">Refresh</span>
          </Button>
        </div>
        {queueQuery.error ? (
          <p className="text-sm text-destructive">
            {queueQuery.error.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="flex min-w-0 flex-col gap-3">
          {queueQuery.isLoading && !queueQuery.data ? (
            <div className="grid gap-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : (
            <OutreachSmsQueueTable
              businesses={businesses}
              selectedId={selectedId}
              onSelect={selectBusiness}
              hasFilters={hasFilters}
            />
          )}

          {totalPages > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              displayPage={page}
              total={queueQuery.data?.total}
              isFetching={queueQuery.isFetching || queueQuery.isPlaceholderData}
              onPrevious={() => {
                selectBusiness(null);
                setPage((prev) => Math.max(1, prev - 1));
              }}
              onNext={() => {
                selectBusiness(null);
                setPage((prev) => prev + 1);
              }}
            />
          ) : null}
        </div>

        <OutreachSmsComposer
          business={selectedBusiness}
          preview={
            previewQuery.data?.business_id === selectedId
              ? previewQuery.data
              : null
          }
          isLoading={previewQuery.isLoading}
          previewError={previewQuery.error?.message ?? null}
          body={body}
          onBodyChange={(value) => {
            setBody(value);
            setBodyEdited(true);
          }}
          onMarkSent={() => markSentMutation.mutate()}
          markSentPending={markSentMutation.isPending}
          markSentDisabled={markSentDisabled}
          onMarkDeclined={() => markDeclinedMutation.mutate()}
          markDeclinedPending={markDeclinedMutation.isPending}
          markDeclinedDisabled={markDeclinedDisabled}
          onSkip={handleSkip}
          actionError={actionError}
        />
      </div>
    </div>
  );
}
