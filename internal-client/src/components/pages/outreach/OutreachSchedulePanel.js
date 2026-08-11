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
import OutreachScheduleCampaignRow, {
  SCHEDULE_LIMITS,
} from "@/components/pages/outreach/OutreachScheduleCampaignRow";
import OutreachScheduleRuns from "@/components/pages/outreach/OutreachScheduleRuns";

const TIMEZONE = "America/Los_Angeles";
const DEFAULT_TIME = "08:00";
const CAMPAIGN_TYPES = [
  "claim_invite",
  "ownership_claim_invite",
  "lead_claim_invite",
  "claim_followup",
];

function normalizeCampaigns(campaigns) {
  const byType = new Map(
    (Array.isArray(campaigns) ? campaigns : []).map((campaign) => [
      campaign.outreach_type,
      campaign,
    ]),
  );

  return CAMPAIGN_TYPES.map((outreachType) => {
    const campaign = byType.get(outreachType);
    const limit = Number(campaign?.limit_count);
    return {
      outreach_type: outreachType,
      // Follow-up defaults off until explicitly enabled in the schedule UI.
      enabled:
        campaign?.enabled ?? (outreachType === "claim_followup" ? false : true),
      limit_count: SCHEDULE_LIMITS.includes(limit) ? limit : 25,
    };
  });
}

function formFromData(data) {
  const configuredTime = data?.schedule?.local_time;
  return {
    enabled: data?.schedule?.enabled ?? false,
    local_time:
      typeof configuredTime === "string" &&
      /^\d{2}:\d{2}/.test(configuredTime)
        ? configuredTime.slice(0, 5)
        : DEFAULT_TIME,
    campaigns: normalizeCampaigns(data?.campaigns),
  };
}

function payloadFromForm(form, enabled = form.enabled) {
  return {
    enabled,
    local_time: form.local_time || DEFAULT_TIME,
    timezone: TIMEZONE,
    campaigns: form.campaigns.map(
      ({ outreach_type, enabled: campaignEnabled, limit_count }) => ({
        outreach_type,
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
        <Skeleton className="h-44 w-full rounded-lg" />
        <Skeleton className="h-44 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function OutreachSchedulePanel({
  accessToken,
  isReady,
  logout,
}) {
  const queryClient = useQueryClient();
  const [formState, setForm] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const scheduleQuery = useQuery({
    queryKey: ["outreach-scheduler"],
    enabled: isReady && Boolean(accessToken),
    staleTime: 30_000,
    queryFn: async () => {
      const result = await fetchApi("/admin/outreach/scheduler", {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load outreach schedule",
        );
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
      const result = await fetchApi("/admin/outreach/scheduler", {
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
          result.error.message || "Failed to update outreach schedule",
        );
      }
      return result.data;
    },
    onMutate: () => {
      setSaveError(null);
      setSaved(false);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["outreach-scheduler"], data);
      setForm(null);
      setSaved(true);
    },
    onError: (error) => {
      setSaveError(error.message || "Failed to update outreach schedule");
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
        <CardFooter>
          <Button
            variant="outline"
            disabled={scheduleQuery.isFetching}
            onClick={() => scheduleQuery.refetch()}
          >
            Try again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const disabled = updateMutation.isPending;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Scheduled outreach</CardTitle>
          <CardDescription>
            Run enabled campaigns every weekday in Pacific time.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="outreach-schedule-time">Daily run time</Label>
            <div className="flex items-center gap-2">
              <Input
                id="outreach-schedule-time"
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
            <p className="text-muted-foreground">
              Timezone: {TIMEZONE}
            </p>
          </div>

          <div className="grid gap-3">
            <div>
              <h2 className="text-sm font-medium">Campaigns</h2>
              <p className="text-muted-foreground">
                Limits are fixed at 10, 25, 50, or 75 recipients per run.
              </p>
            </div>
            {form.campaigns.map((campaign, index) => (
              <OutreachScheduleCampaignRow
                key={campaign.outreach_type}
                campaign={campaign}
                disabled={disabled}
                onChange={(nextCampaign) => {
                  setSaved(false);
                  setForm((current) => ({
                    ...(current ?? persistedForm),
                    campaigns: (current ?? persistedForm).campaigns.map(
                      (item, itemIndex) =>
                        itemIndex === index ? nextCampaign : item,
                    ),
                  }));
                }}
              />
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 border-t">
          <Button
            disabled={disabled || !isDirty || !form.local_time}
            onClick={() => updateMutation.mutate(payloadFromForm(form))}
          >
            <SaveIcon data-icon="inline-start" />
            {updateMutation.isPending ? "Saving…" : "Save schedule"}
          </Button>
          {form.enabled ? (
            <Button
              variant="outline"
              disabled={disabled}
              onClick={() =>
                updateMutation.mutate(payloadFromForm(form, false))
              }
            >
              <PauseIcon data-icon="inline-start" />
              Pause now
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => updateMutation.mutate(payloadFromForm(form, true))}
            >
              <PlayIcon data-icon="inline-start" />
              Resume now
            </Button>
          )}
          {saveError ? (
            <span className="text-xs text-destructive">{saveError}</span>
          ) : saved ? (
            <span className="text-xs text-muted-foreground">
              Schedule saved.
            </span>
          ) : isDirty ? (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          ) : null}
        </CardFooter>
      </Card>

      <OutreachScheduleRuns
        nextRunAt={scheduleQuery.data?.next_run_at}
        lastRunAt={lastRunAt(scheduleQuery.data)}
        bullmqState={scheduleQuery.data?.bullmq_state}
        recentRuns={scheduleQuery.data?.recent_runs}
      />
    </div>
  );
}
