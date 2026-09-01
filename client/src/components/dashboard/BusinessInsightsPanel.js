"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import CompetitorInsightsPanel, {
  clearCachedInsightsForBusiness,
} from "@/components/dashboard/CompetitorInsightsPanel";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: "all", label: "All" },
];

const INSIGHTS_REFRESH_DEBOUNCE_MS = 1000;

export default function BusinessInsightsPanel({
  businesses = [],
  initialBusinessId = "",
}) {
  const [selectedId, setSelectedId] = useState("");
  const [days, setDays] = useState(7);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshLocked, setRefreshLocked] = useState(false);
  const lastInitialIdRef = useRef("");
  const refreshUnlockTimeoutRef = useRef(null);
  const refreshLockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (refreshUnlockTimeoutRef.current) {
        clearTimeout(refreshUnlockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    refreshLockedRef.current = false;
    setRefreshLocked(false);
    if (refreshUnlockTimeoutRef.current) {
      clearTimeout(refreshUnlockTimeoutRef.current);
      refreshUnlockTimeoutRef.current = null;
    }
  }, [selectedId]);

  useEffect(() => {
    if (!businesses.length) {
      setSelectedId("");
      lastInitialIdRef.current = "";
      return;
    }
    if (
      initialBusinessId &&
      initialBusinessId !== lastInitialIdRef.current &&
      businesses.some((business) => business.id === initialBusinessId)
    ) {
      lastInitialIdRef.current = initialBusinessId;
      setSelectedId(initialBusinessId);
      return;
    }
    if (!businesses.some((business) => business.id === selectedId)) {
      setSelectedId(businesses[0].id);
    }
  }, [businesses, selectedId, initialBusinessId]);

  const handleRefresh = () => {
    if (!selectedId || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    clearCachedInsightsForBusiness(selectedId);
    setRefreshKey((key) => key + 1);
    refreshUnlockTimeoutRef.current = setTimeout(() => {
      refreshLockedRef.current = false;
      setRefreshLocked(false);
      refreshUnlockTimeoutRef.current = null;
    }, INSIGHTS_REFRESH_DEBOUNCE_MS);
  };

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) || null,
    [businesses, selectedId]
  );

  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        value: business.id,
        label: business.title,
      })),
    [businesses]
  );

  const periodOptions = useMemo(
    () =>
      PERIOD_OPTIONS.map((option) => ({
        value: String(option.days),
        label: option.label,
      })),
    []
  );

  if (!businesses.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-medium text-foreground">No businesses yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claim a listing to see how you compare to other shops in your city.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden space-y-6 w-full">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SelectMenu
          id="insights-business"
          label="Business"
          value={selectedId}
          onValueChange={setSelectedId}
          options={businessOptions}
          className="min-w-0"
          triggerClassName="sm:min-w-72"
        />
        <div className="flex w-full min-w-0 flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-end sm:justify-end">
          <div className="flex w-full min-w-0 items-end gap-2 sm:hidden">
            <SelectMenu
              id="insights-period"
              label="Time period"
              value={String(days)}
              onValueChange={(value) =>
                setDays(value === "all" ? "all" : Number(value))
              }
              options={periodOptions}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!selectedId || refreshLocked}
              aria-label="Refresh competitor insights"
              className="mb-0.5 shrink-0"
            >
              <RefreshCw aria-hidden="true" />
              Refresh
            </Button>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="inline-flex rounded-full border border-border bg-muted p-1">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setDays(option.days)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer hover:bg-white/50",
                    days === option.days
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!selectedId || refreshLocked}
              aria-label="Refresh competitor insights"
              className="shrink-0"
            >
              <RefreshCw aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <CompetitorInsightsPanel
        business={selectedBusiness}
        days={days}
        refreshKey={refreshKey}
      />

      <p className="text-xs text-muted-foreground">
        Competitor insights are not live. New activity can take a few minutes
        to appear.
      </p>
    </div>
  );
}
