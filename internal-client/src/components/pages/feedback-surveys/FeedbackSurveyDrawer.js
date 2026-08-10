import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  FeedbackSurveyFormTypeBadge,
  FeedbackSurveyFoundLookingForBadge,
  FeedbackSurveyFoundViaBadge,
} from "@/components/pages/feedback-surveys/FeedbackSurveyBadges";
import { FORM_TYPE_LABELS } from "@/components/pages/feedback-surveys/feedbackSurveyLabels";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function FeedbackSurveyDrawer({ survey, open, onOpenChange }) {
  const formLabel =
    FORM_TYPE_LABELS[survey?.form_type] ?? survey?.form_type ?? "Survey";
  const businessTitle = survey?.business?.title;
  const businessId = survey?.business?.id ?? survey?.business_id;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{formLabel} feedback</DrawerTitle>
          <DrawerDescription>Post-submit survey details</DrawerDescription>
        </DrawerHeader>

        {survey ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Form type">
                <FeedbackSurveyFormTypeBadge formType={survey.form_type} />
              </DetailRow>
              <DetailRow label="How they found us">
                <FeedbackSurveyFoundViaBadge foundVia={survey.found_via} />
              </DetailRow>
              <DetailRow label="Found what they were looking for">
                <FeedbackSurveyFoundLookingForBadge
                  foundLookingFor={survey.found_looking_for}
                />
              </DetailRow>
              <DetailRow label="Business">
                {businessTitle && businessId ? (
                  <a
                    href={`/businesses/${businessId}`}
                    className="underline underline-offset-2"
                  >
                    {businessTitle}
                  </a>
                ) : (
                  businessTitle || "—"
                )}
              </DetailRow>
              <DetailRow label="Comment">
                <p className="whitespace-pre-wrap">
                  {survey.comment?.trim() ? survey.comment : "—"}
                </p>
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(survey.created_at)}
              </DetailRow>
              <DetailRow label="Survey ID">
                <span className="break-all font-mono text-xs">
                  {survey.feedback_survey_id}
                </span>
              </DetailRow>
            </dl>
          </div>
        ) : null}

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
