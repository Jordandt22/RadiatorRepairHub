import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import {
  FeedbackSurveyFormTypeBadge,
  FeedbackSurveyFoundLookingForBadge,
  FeedbackSurveyFoundViaBadge,
} from "@/components/pages/feedback-surveys/FeedbackSurveyBadges";
import FeedbackSurveysEmptyState from "@/components/pages/feedback-surveys/FeedbackSurveysEmptyState";

function businessTitle(row) {
  return row?.business?.title || null;
}

function FeedbackSurveysTableView({
  feedbackSurveys,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    feedbackSurveys.length > 0 &&
    feedbackSurveys.every((row) => selectedIds.has(row.feedback_survey_id));
  const someSelected =
    !allSelected &&
    feedbackSurveys.some((row) => selectedIds.has(row.feedback_survey_id));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={feedbackSurveys.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all surveys"
              />
            </TableHead>
            <TableHead className="w-[15%]">Form</TableHead>
            <TableHead className="w-[15%]">Found via</TableHead>
            <TableHead className="w-[17%]">Found what they needed</TableHead>
            <TableHead className="w-[20%]">Business</TableHead>
            <TableHead className="w-[13%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbackSurveys.map((row) => {
            const id = row.feedback_survey_id;
            const title = businessTitle(row);
            const checked = selectedIds.has(id);
            return (
              <TableRow
                key={id}
                className="group"
                data-state={checked ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => onToggleId(id, next === true)}
                    aria-label="Select survey"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <FeedbackSurveyFormTypeBadge formType={row.form_type} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <FeedbackSurveyFoundViaBadge foundVia={row.found_via} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <FeedbackSurveyFoundLookingForBadge
                    foundLookingFor={row.found_looking_for}
                  />
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="block truncate" title={title ?? undefined}>
                    {title ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                    onClick={() => onViewClick(row)}
                  >
                    <EyeIcon />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function FeedbackSurveysCardList({
  feedbackSurveys,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  const allSelected =
    feedbackSurveys.length > 0 &&
    feedbackSurveys.every((row) => selectedIds.has(row.feedback_survey_id));
  const someSelected =
    !allSelected &&
    feedbackSurveys.some((row) => selectedIds.has(row.feedback_survey_id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={feedbackSurveys.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all surveys"
        />
        <span className="text-sm text-muted-foreground">
          {feedbackSurveys.length}{" "}
          {feedbackSurveys.length === 1 ? "survey" : "surveys"}
        </span>
      </div>
      {feedbackSurveys.map((row) => {
        const id = row.feedback_survey_id;
        const title = businessTitle(row);
        const checked = selectedIds.has(id);
        return (
          <div
            key={id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId(id, next === true)}
                aria-label="Select survey"
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <FeedbackSurveyFormTypeBadge formType={row.form_type} />
                  <FeedbackSurveyFoundLookingForBadge
                    foundLookingFor={row.found_looking_for}
                  />
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Found via</dt>
                  <dd>
                    <FeedbackSurveyFoundViaBadge foundVia={row.found_via} />
                  </dd>
                  <dt className="text-muted-foreground">Business</dt>
                  <dd className="truncate">{title ?? "—"}</dd>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(row.created_at)}</dd>
                </dl>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => onViewClick(row)}
                >
                  <EyeIcon />
                  View
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FeedbackSurveysTable({
  feedbackSurveys,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
  activeTab,
}) {
  if (!feedbackSurveys.length) {
    return <FeedbackSurveysEmptyState activeTab={activeTab} />;
  }

  return (
    <>
      <FeedbackSurveysCardList
        feedbackSurveys={feedbackSurveys}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onViewClick={onViewClick}
      />
      <div className="hidden min-w-0 md:block">
        <FeedbackSurveysTableView
          feedbackSurveys={feedbackSurveys}
          selectedIds={selectedIds}
          onToggleId={onToggleId}
          onToggleAll={onToggleAll}
          onViewClick={onViewClick}
        />
      </div>
    </>
  );
}
