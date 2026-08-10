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
import { replaceTab, subscribeToDashboardTab } from "@/lib/dashboardTab";
import { ensureQueryParam } from "@/lib/urlQueryState";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import FeedbackSurveyFormTypeFilterTabs, {
  TAB_FORM_TYPE,
  VALID_TABS,
} from "@/components/pages/feedback-surveys/FeedbackSurveyFormTypeFilterTabs";
import FeedbackSurveyActions from "@/components/pages/feedback-surveys/FeedbackSurveyActions";
import FeedbackSurveysTable from "@/components/pages/feedback-surveys/FeedbackSurveysTable";
import FeedbackSurveysTableSkeleton from "@/components/pages/feedback-surveys/FeedbackSurveysTableSkeleton";
import FeedbackSurveyDrawer from "@/components/pages/feedback-surveys/FeedbackSurveyDrawer";
import BulkDeleteConfirmDialog from "@/components/pages/dashboard/BulkDeleteConfirmDialog";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 10;

function resolveTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "all";
}

export default function FeedbackSurveysPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const { page, setField } = useUrlQueryState(
    { page: { type: "page" } },
    { pathname: "/feedback-surveys" },
  );
  const [activeTab, setActiveTab] = useState(() =>
    resolveTab(searchParams.get("tab")),
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const formTypeFilter = TAB_FORM_TYPE[activeTab] ?? null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    ensureQueryParam("tab", "all", "/feedback-surveys");
  }, [searchParams]);

  useEffect(() => {
    return subscribeToDashboardTab((tab) => {
      setActiveTab(resolveTab(tab));
      setSelectedIds(new Set());
      setField("page", 1);
    });
  }, [setField]);

  const handleTabChange = (tab) => {
    const nextTab = resolveTab(tab);
    if (nextTab === activeTab) return;
    replaceTab(nextTab, "/feedback-surveys");
  };

  const handlePreviousPage = () => {
    setField("page", Math.max(1, page - 1));
    setSelectedIds(new Set());
  };

  const handleNextPage = () => {
    setField("page", page + 1);
    setSelectedIds(new Set());
  };

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["feedback-surveys", page, formTypeFilter ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (formTypeFilter) {
        params.set("form_type", formTypeFilter);
      }

      const result = await fetchApi(
        `/admin/feedback-surveys?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch feedback surveys",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedback_survey_ids) => {
      const result = await fetchApi("/admin/feedback-surveys", {
        method: "DELETE",
        accessToken,
        body: JSON.stringify({ feedback_survey_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to delete surveys";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setConfirmOpen(false);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["feedback-surveys"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to delete surveys");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "feedback-surveys" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setRefreshError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feedback-surveys"] });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  useEffect(() => {
    setLoading(deleteMutation.isPending);
  }, [deleteMutation.isPending, setLoading]);

  const feedbackSurveys = useMemo(
    () => data?.feedbackSurveys ?? [],
    [data?.feedbackSurveys],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const deleteDisabled = !hasSelection || deleteMutation.isPending;
  const showInitialSkeleton = isLoading && !isPlaceholderData && !data;

  const handleToggleId = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const row of feedbackSurveys) {
        if (checked) next.add(row.feedback_survey_id);
        else next.delete(row.feedback_survey_id);
      }
      return next;
    });
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0 || deleteMutation.isPending) return;
    setActionError(null);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    const feedback_survey_ids = Array.from(selectedIds);
    if (feedback_survey_ids.length === 0 || deleteMutation.isPending) return;
    setActionError(null);
    deleteMutation.mutate(feedback_survey_ids);
  };

  const handleViewClick = (survey) => {
    setSelectedSurvey(survey);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <FeedbackSurveyFormTypeFilterTabs
        value={activeTab}
        onValueChange={handleTabChange}
      />

      <div className="mt-2 flex flex-col gap-3 md:mt-4 md:gap-4">
        <FeedbackSurveyActions
          selectedCount={selectedIds.size}
          deleteDisabled={deleteDisabled}
          onDelete={handleDeleteClick}
          onRefresh={() => refreshMutation.mutate()}
          refreshPending={refreshMutation.isPending || isFetching}
          deletePending={deleteMutation.isPending}
          actionError={actionError}
          refreshError={refreshError}
        />

        {error && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {showInitialSkeleton ? (
          <FeedbackSurveysTableSkeleton />
        ) : !error || isPlaceholderData ? (
          <FeedbackSurveysTable
            feedbackSurveys={feedbackSurveys}
            selectedIds={selectedIds}
            onToggleId={handleToggleId}
            onToggleAll={handleToggleAll}
            onViewClick={handleViewClick}
            activeTab={activeTab}
          />
        ) : null}

        <Pagination
          page={page}
          totalPages={totalPages}
          displayPage={data?.page ?? page}
          total={data?.total}
          isFetching={isFetching}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </div>

      <FeedbackSurveyDrawer
        survey={selectedSurvey}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <BulkDeleteConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleConfirmDelete}
        confirmPending={deleteMutation.isPending}
        title="Delete surveys?"
        entityLabelSingular="survey"
        entityLabelPlural="surveys"
      />
    </div>
  );
}
