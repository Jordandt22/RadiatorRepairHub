"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import ClaimEligibilityBadge from "@/components/pages/outreach/ClaimEligibilityBadge";
import {
  evaluateOutreachEligibilityClient,
  formatOutreachSkipReason,
} from "@/components/pages/outreach/outreachEligibility";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function OutreachAddBusinessesSheet({
  open,
  onOpenChange,
  accessToken,
  logout,
  outreachTypeId,
  outreachTypeLabel,
  existingIds,
  remainingSlots,
  onAdd,
}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pickedIds, setPickedIds] = useState(() => new Set());
  const [pickedById, setPickedById] = useState(() => new Map());

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
    setPickedIds(new Set());
    setPickedById(new Map());
  }, [open, outreachTypeId]);

  useEffect(() => {
    const run = debounce((value) => {
      setDebouncedSearch(value);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    run(searchInput);
    return () => run.cancel();
  }, [searchInput]);

  const searchQuery = debouncedSearch.trim();

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["outreach-add-picker", page, searchQuery, outreachTypeId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) params.set("q", searchQuery);

      const result = await fetchApi(
        `/admin/outreach/businesses?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to search businesses");
      }
      return result.data;
    },
    enabled: open && !!accessToken && !!outreachTypeId,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const businesses = data?.businesses ?? [];
  const totalPages = data?.totalPages ?? 0;

  const rows = useMemo(() => {
    return businesses.map((business) => {
      const alreadyAdded = existingIds.has(business.id);
      const evalResult = evaluateOutreachEligibilityClient(
        business,
        outreachTypeId,
      );
      let selectable = evalResult.ok && !alreadyAdded;
      let reason = null;
      if (alreadyAdded) reason = "already_added";
      else if (!evalResult.ok) reason = evalResult.reason;

      return {
        business,
        selectable,
        reason,
        reasonLabel: reason ? formatOutreachSkipReason(reason) : "Eligible",
      };
    });
  }, [businesses, existingIds, outreachTypeId]);

  const handleToggle = (business, checked, selectable) => {
    if (!selectable) return;
    const id = business.id;
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= remainingSlots && !next.has(id)) return prev;
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    setPickedById((prev) => {
      const next = new Map(prev);
      if (checked) {
        if (next.size >= remainingSlots && !next.has(id)) return prev;
        next.set(id, business);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const toAdd = Array.from(pickedById.values()).slice(0, remainingSlots);
    if (toAdd.length === 0) return;
    onAdd(toAdd);
    onOpenChange(false);
  };

  const atCap = pickedIds.size >= remainingSlots;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg" showCloseButton>
        <SheetHeader>
          <SheetTitle>Add businesses</SheetTitle>
          <SheetDescription>
            {outreachTypeLabel
              ? `Search and add for ${outreachTypeLabel}. `
              : "Search and add businesses. "}
            {remainingSlots > 0
              ? `${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} remaining.`
              : "Working set is at the limit."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-6 pb-2">
          <div className="relative shrink-0">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, slug, contact, phone…"
              aria-label="Search businesses to add"
              name="rrh-outreach-add-search"
              className="rounded-full pl-9"
              autoComplete="off"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : null}

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {isLoading && !data ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No businesses found.
              </p>
            ) : (
              rows.map(({ business, selectable, reasonLabel }) => {
                const checked = pickedIds.has(business.id);
                const disabled =
                  !selectable || (!checked && (atCap || remainingSlots <= 0));
                return (
                  <label
                    key={business.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-disabled:cursor-not-allowed has-disabled:opacity-70"
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(next) =>
                        handleToggle(
                          business,
                          next === true,
                          selectable,
                        )
                      }
                      className="mt-0.5"
                      aria-label={`Select ${business.title ?? "business"}`}
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div>
                        <p className="text-sm font-medium">
                          {business.title ?? "—"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {business.email ?? "No email"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <ClaimEligibilityBadge
                          eligibility={business.claim_eligibility}
                        />
                        {selectable ? (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-emerald-100 text-emerald-800"
                          >
                            Eligible
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-amber-100 text-amber-900"
                          >
                            {reasonLabel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {totalPages > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              displayPage={page}
              total={data?.total}
              isFetching={isFetching || isPlaceholderData}
              onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => prev + 1)}
            />
          ) : null}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={pickedIds.size === 0 || remainingSlots <= 0}
            onClick={handleAdd}
          >
            Add {pickedIds.size > 0 ? pickedIds.size : ""} selected
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
