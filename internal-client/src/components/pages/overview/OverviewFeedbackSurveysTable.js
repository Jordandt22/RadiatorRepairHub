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

function businessTitle(row) {
  return row?.business?.title || null;
}

export default function OverviewFeedbackSurveysTable({
  feedbackSurveys = [],
}) {
  if (!feedbackSurveys.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
        No feedback surveys yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {feedbackSurveys.map((row) => {
          const title = businessTitle(row);
          return (
            <div
              key={row.feedback_survey_id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <FeedbackSurveyFormTypeBadge formType={row.form_type} />
                <FeedbackSurveyFoundLookingForBadge
                  foundLookingFor={row.found_looking_for}
                />
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Found via</dt>
                <dd>
                  <FeedbackSurveyFoundViaBadge foundVia={row.found_via} />
                </dd>
                <dt className="text-muted-foreground">Business</dt>
                <dd className="truncate">{title ?? "—"}</dd>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDate(row.created_at)}</dd>
              </dl>
            </div>
          );
        })}
      </div>

      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">Form</TableHead>
              <TableHead className="w-[18%]">Found via</TableHead>
              <TableHead className="w-[20%]">Found what they needed</TableHead>
              <TableHead className="w-[24%]">Business</TableHead>
              <TableHead className="w-[20%]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbackSurveys.map((row) => {
              const title = businessTitle(row);
              return (
                <TableRow key={row.feedback_survey_id}>
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
                    <span
                      className="block truncate"
                      title={title ?? undefined}
                    >
                      {title ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
