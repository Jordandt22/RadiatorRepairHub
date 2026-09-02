"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PauseIcon, PlayIcon, SaveIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/lib/api/fetchApi";
import DigestScheduleRuns from "@/components/pages/digest/DigestScheduleRuns";

const TIMEZONE = "America/Los_Angeles";
const DEFAULT_TIME = "09:00";
const DEFAULT_WEEKDAY = 1;
const SEGMENTS = ["unclaimed", "claimed"];
const LIMITS = [100, 200, 500, 1000, 2500, 5000, 10000];
const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];
const SEGMENT_LABELS = {
  unclaimed: "Unclaimed listings",
  claimed: "Claimed listings",
};

function normalizeWeekday(value) {
  const weekday = Number(value);
  return Number.isInteger(weekday) && weekday >= 0 && weekday <= 6
    ? weekday
    : DEFAULT_WEEKDAY;
}

function weekdayLabel(value) {
  return (
    WEEKDAYS.find((day) => day.value === normalizeWeekday(value))?.label ||
    "Monday"
  );
}

function normalizeCampaigns(campaigns) {
  const byType = new Map(
    (Array.isArray(campaigns) ? campaigns : []).map((campaign) => [
      campaign.digest_segment,
      campaign,
    ]),
  );

  return SEGMENTS.map((digestSegment) => {
    const campaign = byType.get(digestSegment);
    const limit = Number(campaign?.limit_count);
    return {
      digest_segment: digestSegment,
      enabled: campaign?.enabled ?? true,
      limit_count: LIMITS.includes(limit) ? limit : 5000,
    };
  });
}

function formFromData(data) {
  const configuredTime = data?.schedule?.local_time;
  return {
    enabled: data?.schedule?.enabled ?? false,
    local_time:
      typeof configuredTime === "string" && /^\d{2}:\d{2}/.test(configuredTime)
        ? configuredTime.slice(0, 5)
        : DEFAULT_TIME,
    weekday: normalizeWeekday(data?.schedule?.weekday),
    campaigns: normalizeCampaigns(data?.campaigns),
  };
}

function payloadFromForm(form, enabled = form.enabled) {
  return {
    enabled,
    local_time: form.local_time || DEFAULT_TIME,
    timezone: TIMEZONE,
    weekday: normalizeWeekday(form.weekday),
    campaigns: form.campaigns.map(
      ({ digest_segment, enabled: campaignEnabled, limit_count }) => ({
        digest_segment,
        enabled: campaignEnabled,
        limit_count,
      }),
    ),
  };
}

function lastRunAt(data) {
  if (data?.schedule?.last_run_at) return data.schedule.last_run_at;
  const latest = Array.isArray(data?.recent_runs) ? data.recent_runs[0] : null;
  return (
    latest?.completed_at ??
    latest?.finished_at ??
    latest?.started_at ??
    latest?.created_at ??
    latest?.run_at ??
    null
  );
}

function SchedulePanelSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-52 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function DigestSchedulePanel({ accessToken, isReady, logout }) {
  const queryClient = useQueryClient();
  const [formState, setForm] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const scheduleQuery = useQuery({
    queryKey: ["digest-scheduler"],
    enabled: isReady && Boolean(accessToken),
    staleTime: 30_000,
    queryFn: async () => {
      const result = await fetchApi("/admin/digest/scheduler", { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load digest schedule");
      }
      return result.data;
    },
  });

  const persistedForm = useMemo(
    () => formFromData(scheduleQuery.data),
    [scheduleQuery.data],
  );
  const form = formState ?? persistedForm;
  const isDirty = Boolean(
    scheduleQuery.data &&
      JSON.stringify(payloadFromForm(form)) !==
        JSON.stringify(payloadFromForm(persistedForm)),
  );

  useEffect(() => {
    if (!isDirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const result = await fetchApi("/admin/digest/scheduler", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify(payload),
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to update digest schedule",
        );
      }
      return result.data;
    },
    onMutate: () => {
      setSaveError(null);
      setSaved(false);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["digest-scheduler"], data);
      setForm(null);
      setSaved(true);
    },
    onError: (error) => {
      setSaveError(error.message || "Failed to update digest schedule");
    },
  });

  if (scheduleQuery.isLoading && !scheduleQuery.data) {
    return <SchedulePanelSkeleton />;
  }

  if (scheduleQuery.error && !scheduleQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule unavailable</CardTitle>
          <CardDescription>{scheduleQuery.error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const disabled = updateMutation.isPending;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly digest</CardTitle>
          <CardDescription>
            Send gated listing activity emails once a week in Pacific time.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid max-w-sm gap-4">
            <div className="grid gap-2">
              <Label htmlFor="digest-schedule-weekday">Day of week</Label>
              <select
                id="digest-schedule-weekday"
                className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={form.weekday}
                disabled={disabled}
                onChange={(event) => {
                  setSaved(false);
                  setForm((current) => ({
                    ...(current ?? persistedForm),
                    weekday: Number(event.target.value),
                  }));
                }}
              >
                {WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="digest-schedule-time">
                {weekdayLabel(form.weekday)} run time
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="digest-schedule-time"
                  type="time"
                  value={form.local_time}
                  disabled={disabled}
                  onChange={(event) => {
                    setSaved(false);
                    setForm((current) => ({
                      ...(current ?? persistedForm),
                      local_time: event.target.value,
                    }));
                  }}
                  className="w-36"
                />
                <Badge variant="outline">Pacific</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {form.campaigns.map((campaign, index) => (
              <div
                key={campaign.digest_segment}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
              >
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={campaign.enabled}
                    disabled={disabled}
                    onChange={(event) => {
                      setSaved(false);
                      setForm((current) => {
                        const next = {
                          ...(current ?? persistedForm),
                          campaigns: [...(current ?? persistedForm).campaigns],
                        };
                        next.campaigns[index] = {
                          ...next.campaigns[index],
                          enabled: event.target.checked,
                        };
                        return next;
                      });
                    }}
                  />
                  {SEGMENT_LABELS[campaign.digest_segment]}
                </label>
                <select
                  className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                  value={campaign.limit_count}
                  disabled={disabled}
                  onChange={(event) => {
                    setSaved(false);
                    setForm((current) => {
                      const next = {
                        ...(current ?? persistedForm),
                        campaigns: [...(current ?? persistedForm).campaigns],
                      };
                      next.campaigns[index] = {
                        ...next.campaigns[index],
                        limit_count: Number(event.target.value),
                      };
                      return next;
                    });
                  }}
                >
                  {LIMITS.map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} max
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {saveError ? (
            <p className="text-sm text-red-600">{saveError}</p>
          ) : null}
          {saved ? (
            <p className="text-sm text-muted-foreground">Schedule saved.</p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            disabled={disabled}
            onClick={() =>
              updateMutation.mutate(payloadFromForm(form, !form.enabled))
            }
          >
            {form.enabled ? (
              <>
                <PauseIcon /> Pause
              </>
            ) : (
              <>
                <PlayIcon /> Enable
              </>
            )}
          </Button>
          <Button
            variant="outline"
            disabled={disabled || !isDirty}
            onClick={() => updateMutation.mutate(payloadFromForm(form))}
          >
            <SaveIcon /> Save
          </Button>
        </CardFooter>
      </Card>

      <DigestScheduleRuns
        nextRunAt={scheduleQuery.data?.next_run_at}
        lastRunAt={lastRunAt(scheduleQuery.data)}
        bullmqState={scheduleQuery.data?.bullmq_state}
        recentRuns={scheduleQuery.data?.recent_runs}
      />
    </div>
  );
}
