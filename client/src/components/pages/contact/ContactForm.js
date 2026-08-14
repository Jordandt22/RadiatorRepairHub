"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { usePostHog } from "posthog-js/react";

// Contexts
import { useToast } from "@/contexts/ToastProvider";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import { submitContactInquiry } from "@/lib/api/contact-inquiries";
import { submitListingRequest } from "@/lib/api/listing-requests";
import { shouldShowPostSubmitSurvey } from "@/lib/feedbackSurvey";
import PostSubmitSurveyDialog from "@/components/feedback/PostSubmitSurveyDialog";

const isLikelyGoogleMapsUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host === "maps.app.goo.gl" || host === "goo.gl") return true;
  if (host === "maps.google.com" || host.endsWith(".maps.google.com")) {
    return true;
  }
  if (host === "business.google.com" || host.endsWith(".business.google.com")) {
    return true;
  }
  if (host === "google.com" || host.endsWith(".google.com")) {
    return (
      path.includes("/maps") ||
      path.includes("/search") ||
      Boolean(parsed.searchParams.get("cid"))
    );
  }

  return false;
};

const fieldFocusClass =
  "outline-none transition-all duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

const fieldClassName = (hasError, extra = "") =>
  `w-full px-4 py-3 border rounded-lg ${
    extra.includes("bg-") ? "" : "bg-card "
  }${fieldFocusClass} ${
    hasError ? "border-destructive" : "border-border"
  }${extra ? ` ${extra}` : ""}`;

const ContactForm = ({
  prefilledSubject = "",
  lockSubject = false,
  formTitle = "Message RadiatorRepairHub",
  messagePlaceholder = "Tell us about your directory question, listing issue, partnership idea, or website feedback...",
  namePlaceholder = "Enter your full name",
  nameLabel = "Full Name",
  showSubjectInput = true,
  analyticsPage = "contact",
  submissionKind = "contact",
  className = "",
}) => {
  const { showCustomSuccess, showCustomError } = useToast();
  const { user, isSignedIn } = useIsSignedIn();
  const posthog = usePostHog();
  const isGetListed = submissionKind === "get-listed";
  const surveyFormType = isGetListed ? "get_listed" : "contact";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: prefilledSubject,
    googleMapsUrl: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const authEmail =
    typeof user?.email === "string" && user.email.trim()
      ? user.email.trim()
      : "";

  useEffect(() => {
    if (!authEmail) return;
    setFormData((prev) =>
      prev.email.trim() ? prev : { ...prev, email: authEmail },
    );
  }, [authEmail]);

  const subjectOptions = [
    "General Inquiry",
    "Website Feedback / Suggestions",
    "Report a Listing Problem",
    "Advertising / Partnerships",
    "Business Listing Help",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = isGetListed
        ? "Business name is required"
        : "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = isGetListed
        ? "Business name must be at least 2 characters"
        : "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone.trim()) {
      const digits = formData.phone.replace(/\D/g, "");
      const local =
        digits.length === 11 && digits.startsWith("1")
          ? digits.slice(1)
          : digits;
      if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(local)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (showSubjectInput && !formData.subject) {
      newErrors.subject = "Please select an inquiry type";
    }

    if (isGetListed) {
      if (!formData.googleMapsUrl.trim()) {
        newErrors.googleMapsUrl =
          "Google Maps or Google Business link is required";
      } else if (!isLikelyGoogleMapsUrl(formData.googleMapsUrl)) {
        newErrors.googleMapsUrl =
          "Please paste a Google Maps or Google Business Profile link";
      }

      if (
        formData.message.trim() &&
        formData.message.trim().length < 10
      ) {
        newErrors.message = "Message must be at least 10 characters";
      }
    } else if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFieldValid = (fieldName) => {
    const fieldValue = formData[fieldName];

    switch (fieldName) {
      case "name":
        return fieldValue.trim().length >= 2;
      case "email":
        return (
          fieldValue.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)
        );
      case "phone":
        return (
          fieldValue.trim() &&
          /^[\+]?[1-9][\d]{0,15}$/.test(fieldValue.replace(/[\s\-\(\)]/g, ""))
        );
      case "subject":
        return !!fieldValue;
      case "googleMapsUrl":
        return isLikelyGoogleMapsUrl(fieldValue);
      case "message":
        if (isGetListed) {
          return !fieldValue.trim() || fieldValue.trim().length >= 10;
        }
        return fieldValue.trim().length >= 10;
      default:
        return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showCustomError(
        "Please fix the errors below before submitting.",
        "Validation Error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = isGetListed
        ? await submitListingRequest({
            businessName: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            googleMapsUrl: formData.googleMapsUrl.trim(),
            message: formData.message.trim() || null,
          })
        : await submitContactInquiry({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            subject: formData.subject,
            message: formData.message.trim(),
          });

      if (result.error) {
        const fieldErrors = result.error?.message;
        if (fieldErrors && typeof fieldErrors === "object") {
          const nextErrors = {};
          for (const [key, value] of Object.entries(fieldErrors)) {
            if (typeof value === "string") {
              if (key === "businessName") nextErrors.name = value;
              else if (key === "googleMapsUrl") nextErrors.googleMapsUrl = value;
              else nextErrors[key] = value;
            }
          }
          if (Object.keys(nextErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...nextErrors }));
            const firstFieldMessage = Object.values(nextErrors)[0];
            showCustomError(
              firstFieldMessage ||
                "Please fix the errors below before submitting.",
              result.status === 409 ? "Already Submitted" : "Sending Failed"
            );
            return;
          }
        }

        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Sorry, there was an error sending your message. Please try again or contact us directly.";
        showCustomError(
          message,
          result.status === 409 ? "Already Submitted" : "Sending Failed"
        );
        return;
      }

      posthog?.capture("contact_page_submitted", {
        subject: formData.subject || undefined,
        page: analyticsPage,
        signed_in: Boolean(isSignedIn),
        submission_kind: submissionKind,
      });

      setFormData({
        name: "",
        email: authEmail,
        phone: "",
        subject: lockSubject ? prefilledSubject : "",
        googleMapsUrl: "",
        message: "",
      });
      setErrors({});

      showCustomSuccess(
        isGetListed
          ? "Thank you! We received your listing request and will review it within 2-3 business days."
          : "Thank you for your message! We'll get back to you within 24 hours.",
        "Message Sent Successfully"
      );
      if (shouldShowPostSubmitSurvey()) {
        window.setTimeout(() => setSurveyOpen(true), 150);
      }
    } catch (error) {
      console.error("Contact form submit error:", error);
      showCustomError(
        "Sorry, there was an error sending your message. Please try again or contact us directly.",
        "Sending Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div
      className={`bg-card rounded-lg border border-border p-8 ${className}`}
    >
      <h2 className="text-2xl font-bold text-foreground mb-6 font-heading">
        {formTitle}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        role="form"
        aria-label={isGetListed ? "Get listed form" : "Contact form"}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {nameLabel || "Full Name"} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={fieldClassName(errors.name)}
            placeholder={namePlaceholder || "Enter your full name"}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={errors.name ? "true" : "false"}
            required
          />
          {errors.name && (
            <p
              id="name-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={fieldClassName(errors.email)}
            placeholder="Enter your email address"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={errors.email ? "true" : "false"}
            required
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={fieldClassName(errors.phone)}
            placeholder="Enter your phone number (optional)"
            aria-describedby={errors.phone ? "phone-error" : undefined}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          {errors.phone && (
            <p
              id="phone-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {errors.phone}
            </p>
          )}
        </div>

        {showSubjectInput && (
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Inquiry Type *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              disabled={lockSubject}
              className={fieldClassName(
                errors.subject,
                lockSubject ? "bg-muted cursor-not-allowed" : ""
              )}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              aria-invalid={errors.subject ? "true" : "false"}
              required
            >
              <option value="">Select an inquiry type</option>
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p
                id="subject-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.subject}
              </p>
            )}
          </div>
        )}

        {isGetListed && (
          <div>
            <label
              htmlFor="googleMapsUrl"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Google Maps or Google Business Link *
            </label>
            <input
              type="url"
              id="googleMapsUrl"
              name="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={handleInputChange}
              className={fieldClassName(errors.googleMapsUrl)}
              placeholder="https://maps.google.com/... or maps.app.goo.gl/..."
              aria-describedby={
                errors.googleMapsUrl
                  ? "googleMapsUrl-error googleMapsUrl-help"
                  : "googleMapsUrl-help"
              }
              aria-invalid={errors.googleMapsUrl ? "true" : "false"}
              required
            />
            <p
              id="googleMapsUrl-help"
              className="mt-1 text-xs text-muted-foreground"
            >
              Open your business in Google Maps, tap Share, then paste the link
              here.
            </p>
            {errors.googleMapsUrl && (
              <p
                id="googleMapsUrl-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.googleMapsUrl}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {isGetListed ? "Additional Notes" : "Message"}
            {isGetListed ? "" : " *"}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={isGetListed ? 4 : 6}
            className={fieldClassName(errors.message, "resize-none")}
            placeholder={
              isGetListed
                ? "Anything else we should know? (optional)"
                : messagePlaceholder || "Tell us how we can help you..."
            }
            aria-describedby={errors.message ? "message-error" : undefined}
            aria-invalid={errors.message ? "true" : "false"}
            required={!isGetListed}
          />
          {errors.message && (
            <p
              id="message-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {errors.message}
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          By submitting this form, you agree to our{" "}
          <Link
            href="/terms"
            className="text-interactive hover:text-primary underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-interactive hover:text-primary underline"
          >
            Privacy Policy
          </Link>
          {isGetListed
            ? ", and consent to us processing your business name, email, optional phone number, Google listing link, and optional notes so we can review your listing request."
            : ", and consent to us processing your name, email, optional phone number, and message so we can respond to your inquiry."}
        </p>

        <div className="pt-4">
          {isSubmitting ? (
            <div
              className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-muted px-6 py-4 font-semibold text-muted-foreground transition-colors duration-300"
              role="status"
              aria-live="polite"
            >
              <div
                className="mr-4 h-5 w-5 animate-spin rounded-full border-b-2 border-primary"
                aria-hidden="true"
              ></div>
              {isGetListed ? "Submitting..." : "Sending Message..."}
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              aria-label={
                isGetListed ? "Submit listing request" : "Send contact message"
              }
            >
              <Send className="mr-2 h-5 w-5" aria-hidden="true" />
              {isGetListed ? "Submit Listing Request" : "Send Message"}
            </button>
          )}
        </div>
      </form>
    </div>

    <PostSubmitSurveyDialog
      open={surveyOpen}
      onOpenChange={setSurveyOpen}
      formType={surveyFormType}
    />
    </>
  );
};

export default ContactForm;
