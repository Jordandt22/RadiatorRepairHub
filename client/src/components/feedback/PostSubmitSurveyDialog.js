"use client";

import { useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/ToastProvider";
import { submitFeedbackSurvey } from "@/lib/api/feedback-surveys";
import { markPostSubmitSurveySeen } from "@/lib/feedbackSurvey";

const FOUND_VIA_OPTIONS = [
  { value: "google_search", label: "Google search" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social media" },
  { value: "other", label: "Other" },
];

const FOUND_LOOKING_FOR_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partially", label: "Partially" },
];

function PostSubmitSurveyDialog({
  open,
  onOpenChange,
  formType,
  businessId = null,
}) {
  const posthog = usePostHog();
  const { showCustomError } = useToast();
  const handledCloseRef = useRef(false);
  const [foundVia, setFoundVia] = useState("");
  const [foundLookingFor, setFoundLookingFor] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFoundVia("");
    setFoundLookingFor("");
    setComment("");
    setErrors({});
  };

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;

    if (nextOpen) {
      handledCloseRef.current = false;
      onOpenChange?.(true);
      return;
    }

    if (!handledCloseRef.current) {
      markPostSubmitSurveySeen("skip");
      posthog?.capture("feedback_survey_skipped", {
        form_type: formType,
        dismiss_type: "dismiss",
      });
    }
    handledCloseRef.current = false;
    resetForm();
    onOpenChange?.(false);
  };

  const handleSkip = () => {
    if (isSubmitting) return;
    handledCloseRef.current = true;
    markPostSubmitSurveySeen("skip");
    posthog?.capture("feedback_survey_skipped", {
      form_type: formType,
      dismiss_type: "skip",
    });
    onOpenChange?.(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    if (!foundVia) nextErrors.foundVia = "Please select an option.";
    if (!foundLookingFor) {
      nextErrors.foundLookingFor = "Please select an option.";
    }
    if (comment.trim().length > 500) {
      nextErrors.comment = "Feedback must be 500 characters or fewer.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        formType,
        foundVia,
        foundLookingFor,
      };

      if (businessId) payload.businessId = businessId;
      if (comment.trim()) payload.comment = comment.trim();

      const { error } = await submitFeedbackSurvey(payload);

      if (error) {
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to save your feedback. Please try again."
        );
        return;
      }

      handledCloseRef.current = true;
      markPostSubmitSurveySeen("submit");
      posthog?.capture("feedback_survey_submitted", {
        form_type: formType,
        found_via: foundVia,
        found_looking_for: foundLookingFor,
        has_comment: Boolean(comment.trim()),
      });
      onOpenChange?.(false);
      resetForm();
    } catch {
      showCustomError("Unable to save your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Quick feedback</DialogTitle>
          <DialogDescription>
            Optional — two quick questions to help us improve RadiatorRepairHub.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-800">
              How did you find RadiatorRepairHub?
            </legend>
            <RadioGroup
              value={foundVia}
              onValueChange={(value) => {
                setFoundVia(value);
                setErrors((prev) => {
                  if (!prev.foundVia) return prev;
                  const next = { ...prev };
                  delete next.foundVia;
                  return next;
                });
              }}
              className="gap-2"
              disabled={isSubmitting}
            >
              {FOUND_VIA_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RadioGroupItem value={option.value} />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
            {errors.foundVia ? (
              <p className="text-xs text-red-600">{errors.foundVia}</p>
            ) : null}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-800">
              Did you find what you were looking for?
            </legend>
            <RadioGroup
              value={foundLookingFor}
              onValueChange={(value) => {
                setFoundLookingFor(value);
                setErrors((prev) => {
                  if (!prev.foundLookingFor) return prev;
                  const next = { ...prev };
                  delete next.foundLookingFor;
                  return next;
                });
              }}
              className="gap-2"
              disabled={isSubmitting}
            >
              {FOUND_LOOKING_FOR_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RadioGroupItem value={option.value} />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
            {errors.foundLookingFor ? (
              <p className="text-xs text-red-600">{errors.foundLookingFor}</p>
            ) : null}
          </fieldset>

          <div className="space-y-1.5">
            <label
              htmlFor="feedback-survey-comment"
              className="text-sm font-medium text-gray-800"
            >
              Any feedback or suggestions?{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <Textarea
              id="feedback-survey-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setErrors((prev) => {
                  if (!prev.comment) return prev;
                  const next = { ...prev };
                  delete next.comment;
                  return next;
                });
              }}
              placeholder="Share anything that would help us improve..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.comment ? (
              <p className="text-xs text-red-600">{errors.comment}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Sending..." : "Submit feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PostSubmitSurveyDialog;
