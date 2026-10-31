"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/ToastProvider";
import {
  deletePartnerWebsiteIntakeImage,
  fetchPartnerWebsiteIntake,
  patchPartnerWebsiteIntake,
  submitPartnerWebsiteIntake,
  uploadPartnerWebsiteIntakeImage,
  uploadPartnerWebsiteIntakeLogo,
} from "@/lib/api/partnerWebsiteIntake";
import {
  HOUR_12_OPTIONS,
  MINUTE_OPTIONS,
  PERIOD_OPTIONS,
  joinTimeParts,
  normalizeIncomingHours,
  parseTimeToMinutes,
  splitTimeParts,
} from "@/lib/businessHoursFormat";

const EMPTY_SERVICES = () =>
  Array.from({ length: 4 }, () => ({ name: "", description: "" }));

const DEFAULT_PROCESS_STEPS = [
  "Tell us what the car is doing (year, make, and the symptom).",
  "We diagnose and show you what we found.",
  "You approve the estimate before we start.",
  "We complete the repair and check it before you leave.",
];

const CONFIRM_ACTIONS = {
  "restore-hours": {
    title: "Restore listing hours?",
    description:
      "This replaces the hours on this step with the hours from your listing.",
    confirmLabel: "Restore hours",
  },
  "reset-process": {
    title: "Reset to recommended process?",
    description:
      "This replaces your current new-customer process steps with the recommended defaults.",
    confirmLabel: "Reset steps",
  },
  "clear-process": {
    title: "Clear process steps?",
    description:
      "This removes all steps. We’ll use the generic process if you leave this empty.",
    confirmLabel: "Clear steps",
  },
};

const MAX_PROCESS_STEPS = 5;
const MIN_SERVICES_REQUIRED = 4;
const MAX_SERVICES = 20;
const MIN_GALLERY_PHOTOS = 4;
const MAX_GALLERY_PHOTOS = 10;
const MAX_HOURS_PERIODS = 2;

function normalizeProcessSteps(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return { text: item };
        if (item && typeof item === "object") {
          return { text: String(item.text ?? item.step ?? "") };
        }
        return { text: "" };
      })
      .filter((item) => item.text.trim())
      .slice(0, MAX_PROCESS_STEPS);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\r?\n/)
      .map((line) => ({
        text: line.replace(/^\s*\d+[\.)]\s*/, "").trim(),
      }))
      .filter((item) => item.text)
      .slice(0, MAX_PROCESS_STEPS);
  }
  return DEFAULT_PROCESS_STEPS.map((text) => ({ text }));
}

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "17:00";

const timeSelectClassName =
  "rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-muted";

const EMPTY_FORM = {
  name: "",
  googleMapsUrl: "",
  publicEmail: "",
  publicPhone: "",
  preferredEmail: "",
  preferredPhone: "",
  sameAsPublic: true,
  hours: normalizeIncomingHours([]),
  walkIns: true,
  appointments: true,
  preferredDomain: "",
  logo: null,
  images: [],
  description: "",
  yearsOfService: "",
  services: EMPTY_SERVICES(),
  newCustomerProcess: DEFAULT_PROCESS_STEPS.map((text) => ({ text })),
  theme: "dark",
  accentColor: "",
  socials: { facebook: "", instagram: "", youtube: "", tiktok: "" },
  faq: [],
  extraNotes: "",
};

function TimePartSelects({ idPrefix, label, value, disabled, onChange }) {
  const parts = splitTimeParts(value);

  const updatePart = (key, nextValue) => {
    onChange(
      joinTimeParts({
        ...parts,
        [key]:
          key === "minute" || key === "hour12" ? Number(nextValue) : nextValue,
      })
    );
  };

  return (
    <div className="inline-flex items-center gap-1">
      <label className="sr-only" htmlFor={`${idPrefix}-hour`}>
        {label} hour
      </label>
      <select
        id={`${idPrefix}-hour`}
        value={parts.hour12}
        disabled={disabled}
        onChange={(e) => updatePart("hour12", e.target.value)}
        className={timeSelectClassName}
      >
        {HOUR_12_OPTIONS.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-sm text-muted-foreground" aria-hidden>
        :
      </span>
      <label className="sr-only" htmlFor={`${idPrefix}-minute`}>
        {label} minute
      </label>
      <select
        id={`${idPrefix}-minute`}
        value={parts.minute}
        disabled={disabled}
        onChange={(e) => updatePart("minute", e.target.value)}
        className={timeSelectClassName}
      >
        {MINUTE_OPTIONS.map((minute) => (
          <option key={minute} value={minute}>
            {String(minute).padStart(2, "0")}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor={`${idPrefix}-period`}>
        {label} AM or PM
      </label>
      <select
        id={`${idPrefix}-period`}
        value={parts.period}
        disabled={disabled}
        onChange={(e) => updatePart("period", e.target.value)}
        className={timeSelectClassName}
      >
        {PERIOD_OPTIONS.map((period) => (
          <option key={period} value={period}>
            {period}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPriorityDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FieldError({ message }) {
  if (!message) return null;
  return <span className="text-xs text-destructive">{message}</span>;
}

function LimitProgress({ current, max, min = 0, unitLabel = "" }) {
  const safeMax = Math.max(1, max);
  const value = Math.min(Math.max(0, current), safeMax);
  const pct = Math.round((value / safeMax) * 100);
  const metMin = current >= min;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {min > 0 ? `Min ${min}` : "Optional"}
          {unitLabel ? ` · ${unitLabel}` : ""}
        </span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-300 ${
            metMin ? "bg-emerald-500" : "bg-destructive"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const TOTAL_STEPS = 4;

const STEP_TITLES = {
  1: "Confirm Details",
  2: "Website Essentials",
  3: "Services",
  4: "Extras",
};

const STEP_HELP = {
  1: "Confirm the public listing details customers will see. Preferred contact stays private.",
  2: "Add your domain preference, optional logo, 4–10 shop photos, and how new customers get started.",
  3: "List at least 4 services you want featured on the site.",
  4: "Optional extras like theme, socials, and FAQ. Skip anything you don’t have yet.",
};

function ProgressBar({ step }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {STEP_TITLES[step] || `Step ${step}`}
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SetupSidebar({
  step,
  furthestStep,
  priorityUntil,
  priorityActive,
  onSelectStep,
}) {
  return (
    <aside className="w-full shrink-0 md:sticky md:top-20 md:z-10 md:w-1/3 md:self-start">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Setup progress
          </p>
          <ol className="mt-3 space-y-1">
            {[1, 2, 3, 4].map((stepNum) => {
              const status =
                stepNum === step
                  ? "current"
                  : stepNum <= furthestStep
                    ? "complete"
                    : "upcoming";
              const clickable = status === "complete";
              return (
                <li key={stepNum}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => onSelectStep(stepNum)}
                    className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                      status === "current"
                        ? "bg-muted font-medium text-foreground"
                        : status === "complete"
                          ? "text-foreground hover:bg-muted/70"
                          : "cursor-default text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        status === "complete"
                          ? "bg-emerald-500 text-white"
                          : status === "current"
                            ? "border-2 border-emerald-500 text-emerald-700"
                            : "border border-border bg-background text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {status === "complete" ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        stepNum
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">
                        {STEP_TITLES[stepNum]}
                      </span>
                      {stepNum === 4 ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          Optional
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {priorityUntil ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              priorityActive
                ? "border-primary/30 bg-primary/5 text-foreground"
                : "border-border bg-muted/40 text-muted-foreground"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {priorityActive ? "Priority window" : "Priority paused"}
            </p>
            {priorityActive ? (
              <p className="mt-1.5">
                Through <strong>{formatPriorityDate(priorityUntil)}</strong>.
                Finish soon so we can start while you’re in the queue.
              </p>
            ) : (
              <p className="mt-1.5">
                Ended {formatPriorityDate(priorityUntil)}. You can still finish
                setup — we’ll build in regular order.
              </p>
            )}
          </div>
        ) : null}

        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            This step
          </p>
          <p className="mt-1.5 text-foreground">{STEP_HELP[step]}</p>
        </div>
      </div>
    </aside>
  );
}

function ToggleRow({ id, label, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
      <label htmlFor={id} className="cursor-pointer font-medium text-foreground">
        {label}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default function WebsitePanel({ businesses = [], initialBusinessId = "" }) {
  const { showCustomError, showCustomSuccess } = useToast();
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [intake, setIntake] = useState(null);
  const [listing, setListing] = useState(null);
  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const lastInitialIdRef = useRef("");
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    setFurthestStep((prev) => Math.max(prev, step));
  }, [step]);

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

  useEffect(() => {
    if (!selectedBusiness?.is_partner) {
      setIntake(null);
      setListing(null);
      setForm(EMPTY_FORM);
      setFieldErrors({});
      setStep(1);
      setFurthestStep(1);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setFieldErrors({});
    fetchPartnerWebsiteIntake(selectedBusiness.id).then(
      ({ data, error, status }) => {
        if (cancelled) return;
        if (error || status >= 400) {
          showCustomError(
            typeof error?.message === "string"
              ? error.message
              : "Unable to load website setup."
          );
          setIntake(null);
          setListing(null);
          setLoading(false);
          return;
        }
        const nextIntake = data?.intake ?? null;
        setIntake(nextIntake);
        setListing(data?.listing ?? null);
        const payload = nextIntake?.payload || EMPTY_FORM;
        setForm({
          ...EMPTY_FORM,
          ...payload,
          hours: normalizeIncomingHours(
            Array.isArray(payload.hours) ? payload.hours : []
          ),
          services:
            Array.isArray(payload.services) && payload.services.length
              ? payload.services
              : EMPTY_SERVICES(),
          socials: {
            ...EMPTY_FORM.socials,
            ...(payload.socials || {}),
          },
          faq: Array.isArray(payload.faq) ? payload.faq : [],
          images: Array.isArray(payload.images) ? payload.images : [],
          newCustomerProcess: normalizeProcessSteps(payload.newCustomerProcess),
        });
        const resumeStep = Math.min(
          TOTAL_STEPS,
          Math.max(1, Number(nextIntake?.currentStep) || 1)
        );
        setStep(resumeStep);
        setFurthestStep(resumeStep);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [selectedBusiness, showCustomError]);

  const clearFieldError = (field) => {
    if (!fieldErrors[field] && !fieldErrors.form) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  };

  const onChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "sameAsPublic" && value) {
        next.preferredEmail = next.publicEmail;
        next.preferredPhone = next.publicPhone;
      }
      if (field === "publicEmail" && next.sameAsPublic) {
        next.preferredEmail = value;
      }
      if (field === "publicPhone" && next.sameAsPublic) {
        next.preferredPhone = value;
      }
      return next;
    });
    clearFieldError(field);
  };

  const onSocialChange = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }));
    clearFieldError(`socials.${key}`);
  };

  const onServiceChange = (index, key) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const services = [...prev.services];
      services[index] = { ...services[index], [key]: value };
      return { ...prev, services };
    });
    clearFieldError("services");
  };

  const applyIntake = (nextIntake, { syncStep = false } = {}) => {
    if (!nextIntake) return;
    setIntake(nextIntake);
    const payload = nextIntake.payload || {};
    setForm((prev) => ({
      ...prev,
      ...payload,
      hours: Array.isArray(payload.hours)
        ? normalizeIncomingHours(payload.hours)
        : prev.hours,
      services:
        Array.isArray(payload.services) && payload.services.length
          ? payload.services
          : prev.services,
      socials: { ...prev.socials, ...(payload.socials || {}) },
      faq: Array.isArray(payload.faq) ? payload.faq : prev.faq,
      images: Array.isArray(payload.images) ? payload.images : prev.images,
      logo: payload.logo ?? prev.logo,
      newCustomerProcess: Object.prototype.hasOwnProperty.call(
        payload,
        "newCustomerProcess"
      )
        ? normalizeProcessSteps(payload.newCustomerProcess)
        : prev.newCustomerProcess,
    }));
    if (syncStep && nextIntake.currentStep) {
      setStep(
        Math.min(TOTAL_STEPS, Math.max(1, Number(nextIntake.currentStep)))
      );
    }
  };

  const saveStep = async (currentStep, { soft = false } = {}) => {
    if (!selectedBusiness?.is_partner || saving) return false;
    setSaving(true);
    setFieldErrors({});
    const { data, error, status } = await patchPartnerWebsiteIntake(
      selectedBusiness.id,
      { ...form, step: currentStep, soft }
    );
    setSaving(false);

    if (status === 422 && error?.message && typeof error.message === "object") {
      setFieldErrors(error.message);
      return false;
    }
    if (error || status >= 400) {
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to save this step."
      );
      return false;
    }

    applyIntake(data?.intake);
    return true;
  };

  const onContinue = async () => {
    const ok = await saveStep(step);
    if (!ok) return;
    setStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
  };

  const onBack = async () => {
    const ok = await saveStep(step, { soft: true });
    if (!ok) return;
    setStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBusiness?.is_partner || saving) return;

    if (step < TOTAL_STEPS) {
      await onContinue();
      return;
    }

    const saved = await saveStep(TOTAL_STEPS);
    if (!saved) return;

    setSaving(true);
    setFieldErrors({});
    const { data, error, status } = await submitPartnerWebsiteIntake(
      selectedBusiness.id,
      form
    );
    setSaving(false);

    if (status === 422 && error?.message && typeof error.message === "object") {
      setFieldErrors(error.message);
      return;
    }
    if (error || status >= 400) {
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to submit website details."
      );
      return;
    }

    setIntake(
      data?.intake ?? {
        status: "submitted",
        submittedAt: new Date().toISOString(),
      }
    );
    showCustomSuccess("Website details submitted. We’ll take it from here.");
  };

  const onLogoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedBusiness) return;
    setUploading(true);
    const { data, error, status } = await uploadPartnerWebsiteIntakeLogo(
      selectedBusiness.id,
      file
    );
    setUploading(false);
    if (status === 422 && error?.message && typeof error.message === "object") {
      setFieldErrors(error.message);
      return;
    }
    if (error || status >= 400) {
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to upload logo."
      );
      return;
    }
    clearFieldError("logo");
    applyIntake(data?.intake);
  };

  const onGalleryPick = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !selectedBusiness) return;
    setUploading(true);
    let lastIntake = null;
    for (const file of files) {
      if ((form.images?.length || 0) >= MAX_GALLERY_PHOTOS) break;
      const { data, error, status } = await uploadPartnerWebsiteIntakeImage(
        selectedBusiness.id,
        file
      );
      if (status === 422 && error?.message && typeof error.message === "object") {
        setFieldErrors(error.message);
        break;
      }
      if (error || status >= 400) {
        showCustomError(
          typeof error?.message === "string"
            ? error.message
            : "Unable to upload image."
        );
        break;
      }
      lastIntake = data?.intake;
      if (data?.intake?.payload?.images) {
        setForm((prev) => ({
          ...prev,
          images: data.intake.payload.images,
        }));
      }
    }
    setUploading(false);
    clearFieldError("images");
    if (lastIntake) applyIntake(lastIntake);
  };

  const onDeleteImage = async (imageId) => {
    if (!selectedBusiness || uploading) return;
    setUploading(true);
    const { data, error, status } = await deletePartnerWebsiteIntakeImage(
      selectedBusiness.id,
      imageId
    );
    setUploading(false);
    if (error || status >= 400) {
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to remove image."
      );
      return;
    }
    applyIntake(data?.intake);
  };

  const updateHoursDay = (dayOfWeek, updater) => {
    setForm((prev) => ({
      ...prev,
      hours: (prev.hours || []).map((day) =>
        day.day_of_week === dayOfWeek ? updater(day) : day
      ),
    }));
    clearFieldError("hours");
    clearFieldError(`hours.${dayOfWeek}`);
  };

  const setHoursClosed = (dayOfWeek, isClosed) => {
    updateHoursDay(dayOfWeek, (day) => {
      if (isClosed) return { ...day, is_closed: true, hours: [] };
      return {
        ...day,
        is_closed: false,
        hours:
          day.hours?.length > 0
            ? day.hours
            : [{ open: DEFAULT_OPEN, close: DEFAULT_CLOSE }],
      };
    });
  };

  const setHoursPeriodField = (dayOfWeek, periodIndex, field, value) => {
    updateHoursDay(dayOfWeek, (day) => {
      const hours = [...(day.hours || [])];
      hours[periodIndex] = { ...hours[periodIndex], [field]: value };
      return { ...day, hours };
    });
  };

  const addHoursPeriod = (dayOfWeek) => {
    updateHoursDay(dayOfWeek, (day) => {
      if (day.is_closed || (day.hours?.length || 0) >= MAX_HOURS_PERIODS)
        return day;
      const previousClose =
        day.hours?.[day.hours.length - 1]?.close || DEFAULT_OPEN;
      const openMinutes = parseTimeToMinutes(previousClose) ?? 9 * 60;
      const closeMinutes = Math.min(openMinutes + 60, 23 * 60 + 45);
      const toTime = (total) => {
        const h = String(Math.floor(total / 60)).padStart(2, "0");
        const m = String(total % 60).padStart(2, "0");
        return `${h}:${m}`;
      };
      const open = toTime(openMinutes);
      const close =
        closeMinutes > openMinutes
          ? toTime(closeMinutes)
          : toTime(Math.min(openMinutes + 15, 23 * 60 + 45));
      return {
        ...day,
        hours: [...(day.hours || []), { open, close }],
      };
    });
  };

  const removeHoursPeriod = (dayOfWeek, periodIndex) => {
    updateHoursDay(dayOfWeek, (day) => {
      const hours = (day.hours || []).filter((_, index) => index !== periodIndex);
      if (hours.length === 0) {
        return { ...day, is_closed: true, hours: [] };
      }
      return { ...day, hours };
    });
  };

  const addService = () => {
    setForm((prev) => {
      if (prev.services.length >= MAX_SERVICES) return prev;
      return {
        ...prev,
        services: [...prev.services, { name: "", description: "" }],
      };
    });
  };

  const removeService = (index) => {
    setForm((prev) => {
      if (prev.services.length <= MIN_SERVICES_REQUIRED) return prev;
      return {
        ...prev,
        services: prev.services.filter((_, i) => i !== index),
      };
    });
  };

  const namedServiceCount = (form.services || []).filter((s) =>
    s.name?.trim()
  ).length;

  const onProcessStepChange = (index) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const steps = [...(prev.newCustomerProcess || [])];
      steps[index] = { text: value };
      return { ...prev, newCustomerProcess: steps };
    });
    clearFieldError("newCustomerProcess");
  };

  const addProcessStep = () => {
    setForm((prev) => {
      const steps = prev.newCustomerProcess || [];
      if (steps.length >= MAX_PROCESS_STEPS) return prev;
      return {
        ...prev,
        newCustomerProcess: [...steps, { text: "" }],
      };
    });
  };

  const removeProcessStep = (index) => {
    setForm((prev) => {
      const steps = prev.newCustomerProcess || [];
      return {
        ...prev,
        newCustomerProcess: steps.filter((_, i) => i !== index),
      };
    });
  };

  const listingHours = useMemo(
    () => normalizeIncomingHours(listing?.hoursDays || []),
    [listing]
  );

  const listingHasHours = useMemo(
    () => listingHours.some((day) => !day.is_closed && day.hours?.length),
    [listingHours]
  );

  const applyRestoreListingHours = () => {
    const restored = normalizeIncomingHours(listing?.hoursDays || []);
    setForm((prev) => ({
      ...prev,
      hours: restored,
    }));
    clearFieldError("hours");
    for (const day of restored) {
      clearFieldError(`hours.${day.day_of_week}`);
    }
  };

  const applyResetProcessToRecommended = () => {
    setForm((prev) => ({
      ...prev,
      newCustomerProcess: DEFAULT_PROCESS_STEPS.map((text) => ({ text })),
    }));
    clearFieldError("newCustomerProcess");
  };

  const applyClearProcessSteps = () => {
    setForm((prev) => ({
      ...prev,
      newCustomerProcess: [],
    }));
    clearFieldError("newCustomerProcess");
  };

  const restoreListingHours = () => {
    if (!listingHasHours || saving) return;
    setConfirmAction("restore-hours");
  };

  const resetProcessToRecommended = () => {
    if (saving) return;
    setConfirmAction("reset-process");
  };

  const clearProcessSteps = () => {
    if (saving) return;
    if ((form.newCustomerProcess?.length || 0) === 0) return;
    setConfirmAction("clear-process");
  };

  const closeConfirm = () => setConfirmAction(null);

  const runConfirmAction = () => {
    if (confirmAction === "restore-hours") applyRestoreListingHours();
    else if (confirmAction === "reset-process") applyResetProcessToRecommended();
    else if (confirmAction === "clear-process") applyClearProcessSteps();
    setConfirmAction(null);
  };

  const confirmCopy = confirmAction ? CONFIRM_ACTIONS[confirmAction] : null;

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faq: [...(prev.faq || []), { question: "", answer: "" }],
    }));
  };

  const onFaqChange = (index, key) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const faq = [...(prev.faq || [])];
      faq[index] = { ...faq[index], [key]: value };
      return { ...prev, faq };
    });
    clearFieldError("faq");
  };

  const removeFaq = (index) => {
    setForm((prev) => ({
      ...prev,
      faq: (prev.faq || []).filter((_, i) => i !== index),
    }));
  };

  if (!businesses.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-medium text-foreground">No businesses yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claim a listing to manage Partner website setup here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Website
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Finish setup so we can build your Partner site.
          </p>
        </div>
        {businessOptions.length > 1 ? (
          <SelectMenu
            className="w-full sm:w-72"
            triggerClassName="w-full"
            aria-label="Business"
            value={selectedId}
            onValueChange={setSelectedId}
            options={businessOptions}
          />
        ) : null}
      </div>

      {!selectedBusiness?.is_partner ? (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-5 py-6">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Partner website setup
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Partner website setup comes with a Partner listing.
            </p>
          </div>
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading website setup…</p>
      ) : intake?.status === "submitted" ? (
        <div className="rounded-lg border border-border bg-card px-5 py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Check className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Details submitted
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanks — we have what we need to start on your Partner website.
                {intake.submittedAt
                  ? ` Submitted ${formatDateTime(intake.submittedAt)}.`
                  : ""}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Site analytics will show here after your site is live and
                connected.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <form
          noValidate
          onSubmit={onSubmit}
          className="w-full rounded-lg border border-border bg-card px-5 py-6 md:w-2/3"
        >
          <ProgressBar step={step} />

          <div className="mt-6 grid gap-4">
            {step === 1 ? (
              <>
                <label className="grid gap-1.5 text-sm font-medium">
                  Business name
                  <Input
                    value={form.name}
                    onChange={onChange("name")}
                    disabled={saving}
                    aria-invalid={Boolean(fieldErrors.name)}
                  />
                  <FieldError message={fieldErrors.name} />
                </label>
                <div className="grid gap-1.5 text-sm font-medium">
                  <label htmlFor="partner-intake-google-maps">
                    Google Maps link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="partner-intake-google-maps"
                      value={form.googleMapsUrl}
                      onChange={onChange("googleMapsUrl")}
                      placeholder="https://maps.google.com/..."
                      disabled={saving}
                      aria-invalid={Boolean(fieldErrors.googleMapsUrl)}
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving || !form.googleMapsUrl?.trim()}
                      aria-label="Open Google Maps link"
                      onClick={() => {
                        const url = form.googleMapsUrl.trim();
                        if (!url) return;
                        const href = /^https?:\/\//i.test(url)
                          ? url
                          : `https://${url}`;
                        window.open(href, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="size-4" />
                      Check
                    </Button>
                  </div>
                  <FieldError message={fieldErrors.googleMapsUrl} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Public email
                    <Input
                      type="email"
                      value={form.publicEmail}
                      onChange={onChange("publicEmail")}
                      disabled={saving}
                      aria-invalid={Boolean(fieldErrors.publicEmail)}
                    />
                    <FieldError message={fieldErrors.publicEmail} />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Public phone
                    <Input
                      value={form.publicPhone}
                      onChange={onChange("publicPhone")}
                      disabled={saving}
                      aria-invalid={Boolean(fieldErrors.publicPhone)}
                    />
                    <FieldError message={fieldErrors.publicPhone} />
                  </label>
                </div>
                <div className="grid gap-1.5">
                  <ToggleRow
                    id="same-as-public"
                    label="Preferred contact same as public"
                    checked={form.sameAsPublic}
                    onChange={(checked) =>
                      onChange("sameAsPublic")({
                        target: { type: "checkbox", checked },
                      })
                    }
                    disabled={saving}
                  />
                  <p className="text-sm text-muted-foreground">
                    Preferred contact is private — for us only.
                  </p>
                </div>
                {!form.sameAsPublic ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-medium">
                      Preferred email (private)
                      <Input
                        type="email"
                        value={form.preferredEmail}
                        onChange={onChange("preferredEmail")}
                        disabled={saving}
                        aria-invalid={Boolean(fieldErrors.preferredEmail)}
                      />
                      <FieldError message={fieldErrors.preferredEmail} />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Preferred phone (private)
                      <Input
                        value={form.preferredPhone}
                        onChange={onChange("preferredPhone")}
                        disabled={saving}
                      />
                    </label>
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-medium">Hours</span>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Set open and close times for each day. Maximum{" "}
                        {MAX_HOURS_PERIODS} time sets per day (for example a
                        lunch break).
                      </p>
                    </div>
                    {listingHasHours ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={restoreListingHours}
                      >
                        <RotateCcw className="size-4" />
                        Restore listing hours
                      </Button>
                    ) : null}
                  </div>
                  <FieldError message={fieldErrors.hours} />
                  <div className="space-y-3">
                    {(form.hours || []).map((day) => {
                      const disabled = day.is_closed || saving;
                      return (
                        <div
                          key={day.day_of_week}
                          className="rounded-md border border-border p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {day.day_of_week}
                            </span>
                            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={day.is_closed}
                                onChange={(e) =>
                                  setHoursClosed(
                                    day.day_of_week,
                                    e.target.checked
                                  )
                                }
                                disabled={saving}
                                className="rounded border-border text-primary focus:ring-ring"
                              />
                              Closed
                            </label>
                          </div>

                          <div
                            className={`space-y-2 ${day.is_closed ? "opacity-50" : ""}`}
                          >
                            {(day.is_closed
                              ? [{ open: DEFAULT_OPEN, close: DEFAULT_CLOSE }]
                              : day.hours
                            ).map((period, periodIndex) => (
                              <div
                                key={`${day.day_of_week}-period-${periodIndex}`}
                                className="flex flex-wrap items-center gap-2"
                              >
                                <TimePartSelects
                                  idPrefix={`${day.day_of_week}-open-${periodIndex}`}
                                  label={`${day.day_of_week} open time ${periodIndex + 1}`}
                                  value={period.open}
                                  disabled={disabled}
                                  onChange={(value) =>
                                    setHoursPeriodField(
                                      day.day_of_week,
                                      periodIndex,
                                      "open",
                                      value
                                    )
                                  }
                                />
                                <span className="text-sm text-muted-foreground">
                                  to
                                </span>
                                <TimePartSelects
                                  idPrefix={`${day.day_of_week}-close-${periodIndex}`}
                                  label={`${day.day_of_week} close time ${periodIndex + 1}`}
                                  value={period.close}
                                  disabled={disabled}
                                  onChange={(value) =>
                                    setHoursPeriodField(
                                      day.day_of_week,
                                      periodIndex,
                                      "close",
                                      value
                                    )
                                  }
                                />
                                {!day.is_closed && day.hours.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeHoursPeriod(
                                        day.day_of_week,
                                        periodIndex
                                      )
                                    }
                                    disabled={saving}
                                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50"
                                    aria-label={`Remove period ${periodIndex + 1} for ${day.day_of_week}`}
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                ) : null}
                              </div>
                            ))}

                            {!day.is_closed ? (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <LimitProgress
                                  current={day.hours?.length || 0}
                                  max={MAX_HOURS_PERIODS}
                                  min={1}
                                  unitLabel="time sets"
                                />
                                {(day.hours?.length || 0) < MAX_HOURS_PERIODS ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addHoursPeriod(day.day_of_week)
                                    }
                                    disabled={saving}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary disabled:opacity-50"
                                  >
                                    <Plus className="size-3.5" />
                                    Add time set
                                  </button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Max {MAX_HOURS_PERIODS} time sets
                                  </span>
                                )}
                              </div>
                            ) : null}
                          </div>

                          <FieldError
                            message={fieldErrors[`hours.${day.day_of_week}`]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleRow
                    id="walk-ins"
                    label="Walk-ins welcome"
                    checked={form.walkIns}
                    onChange={(checked) =>
                      onChange("walkIns")({
                        target: { type: "checkbox", checked },
                      })
                    }
                    disabled={saving}
                  />
                  <ToggleRow
                    id="appointments"
                    label="Appointments available"
                    checked={form.appointments}
                    onChange={(checked) =>
                      onChange("appointments")({
                        target: { type: "checkbox", checked },
                      })
                    }
                    disabled={saving}
                  />
                </div>
                <FieldError message={fieldErrors.walkIns} />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <label className="grid gap-1.5 text-sm font-medium">
                  Preferred domain
                  <Input
                    value={form.preferredDomain}
                    onChange={onChange("preferredDomain")}
                    placeholder="ironbayradiator.com"
                    disabled={saving}
                    aria-invalid={Boolean(fieldErrors.preferredDomain)}
                  />
                  <FieldError message={fieldErrors.preferredDomain} />
                </label>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">Logo</span>
                  <p className="text-sm text-muted-foreground">
                    Optional — you can skip this if you don’t have a logo yet.
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onLogoPick}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    {form.logo?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.logo.url}
                        alt="Logo preview"
                        className="size-16 rounded-md border border-border object-contain bg-muted"
                      />
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving || uploading}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="size-4" />
                      {form.logo ? "Replace logo" : "Upload logo"}
                    </Button>
                  </div>
                  <FieldError message={fieldErrors.logo} />
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">
                    Gallery photos <span className="text-destructive">*</span>
                  </span>
                  <LimitProgress
                    current={form.images?.length || 0}
                    max={MAX_GALLERY_PHOTOS}
                    min={MIN_GALLERY_PHOTOS}
                    unitLabel="photos"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={onGalleryPick}
                  />
                  <div className="flex flex-wrap gap-3">
                    {(form.images || []).map((image) => (
                      <div
                        key={image.imageId}
                        className="relative size-20 overflow-hidden rounded-md border border-border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt=""
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded bg-background/90 p-1 text-destructive"
                          aria-label="Remove image"
                          disabled={uploading}
                          onClick={() => onDeleteImage(image.imageId)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    disabled={
                      saving ||
                      uploading ||
                      (form.images?.length || 0) >= MAX_GALLERY_PHOTOS
                    }
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    Add photos
                  </Button>
                  <FieldError message={fieldErrors.images} />
                </div>

                <label className="grid gap-1.5 text-sm font-medium">
                  Business description
                  <Textarea
                    value={form.description}
                    onChange={onChange("description")}
                    rows={4}
                    disabled={saving}
                    aria-invalid={Boolean(fieldErrors.description)}
                    placeholder="Tell customers about your shop — what you specialize in, how long you’ve been in the area, and what makes your service different."
                  />
                  <FieldError message={fieldErrors.description} />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Years of service
                  <Input
                    value={form.yearsOfService}
                    onChange={onChange("yearsOfService")}
                    placeholder="20"
                    disabled={saving}
                    aria-invalid={Boolean(fieldErrors.yearsOfService)}
                  />
                  <FieldError message={fieldErrors.yearsOfService} />
                </label>

                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <span className="text-sm font-medium">
                        New customer process
                      </span>
                      <LimitProgress
                        current={form.newCustomerProcess?.length || 0}
                        max={MAX_PROCESS_STEPS}
                        min={0}
                        unitLabel="steps"
                      />
                      <p className="text-sm text-muted-foreground">
                        Optional — leave empty to use our generic process.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={resetProcessToRecommended}
                      >
                        <RotateCcw className="size-4" />
                        Reset to recommended
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          saving ||
                          (form.newCustomerProcess?.length || 0) === 0
                        }
                        onClick={clearProcessSteps}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          saving ||
                          (form.newCustomerProcess?.length || 0) >=
                            MAX_PROCESS_STEPS
                        }
                        onClick={addProcessStep}
                      >
                        <Plus className="size-4" />
                        Add step
                      </Button>
                    </div>
                  </div>
                  <FieldError message={fieldErrors.newCustomerProcess} />
                  <div className="space-y-2">
                    {(form.newCustomerProcess || []).length === 0 ? (
                      <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                        No custom steps. We’ll use a generic new-customer
                        process.
                      </p>
                    ) : null}
                    {(form.newCustomerProcess || []).map((item, index) => (
                      <div
                        key={`process-${index}`}
                        className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3"
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                          aria-hidden="true"
                        >
                          {index + 1}
                        </span>
                        <Input
                          className="min-w-0 flex-1"
                          value={item.text}
                          onChange={onProcessStepChange(index)}
                          disabled={saving}
                          placeholder={`Step ${index + 1}`}
                          aria-label={`New customer process step ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove step ${index + 1}`}
                          disabled={saving}
                          onClick={() => removeProcessStep(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <span className="text-sm font-medium">
                        Services <span className="text-destructive">*</span>
                      </span>
                      <LimitProgress
                        current={namedServiceCount}
                        max={MAX_SERVICES}
                        min={MIN_SERVICES_REQUIRED}
                        unitLabel="named services"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        saving || form.services.length >= MAX_SERVICES
                      }
                      onClick={addService}
                    >
                      <Plus className="size-4" />
                      Add service
                    </Button>
                  </div>
                  <FieldError message={fieldErrors.services} />
                  {form.services.map((service, index) => (
                    <div
                      key={`service-${index}`}
                      className="grid gap-2 rounded-md border border-border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="grid flex-1 gap-1.5 text-sm font-medium">
                          <span>
                            Service name{" "}
                            {index < MIN_SERVICES_REQUIRED ? (
                              <span className="text-destructive">*</span>
                            ) : null}
                          </span>
                          <Input
                            value={service.name}
                            onChange={onServiceChange(index, "name")}
                            disabled={saving}
                            aria-required={index < MIN_SERVICES_REQUIRED}
                            aria-invalid={Boolean(fieldErrors.services)}
                            placeholder={
                              index < MIN_SERVICES_REQUIRED
                                ? `Required service ${index + 1}`
                                : "Optional additional service"
                            }
                          />
                        </label>
                        {form.services.length > MIN_SERVICES_REQUIRED ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove service"
                            disabled={saving}
                            onClick={() => removeService(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                      <label className="grid gap-1.5 text-sm font-medium">
                        Short description
                        <Textarea
                          value={service.description}
                          onChange={onServiceChange(index, "description")}
                          rows={2}
                          disabled={saving}
                          placeholder="Briefly describe what’s included or who it’s for."
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Theme
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.theme}
                      onChange={onChange("theme")}
                      disabled={saving}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Accent color
                    <Input
                      value={form.accentColor}
                      onChange={onChange("accentColor")}
                      placeholder="#E31B16"
                      disabled={saving}
                      aria-invalid={Boolean(fieldErrors.accentColor)}
                    />
                    <FieldError message={fieldErrors.accentColor} />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {["facebook", "instagram", "youtube", "tiktok"].map((key) => (
                    <label
                      key={key}
                      className="grid gap-1.5 text-sm font-medium capitalize"
                    >
                      {key}
                      <Input
                        value={form.socials?.[key] || ""}
                        onChange={onSocialChange(key)}
                        placeholder="https://"
                        disabled={saving}
                        aria-invalid={Boolean(fieldErrors[`socials.${key}`])}
                      />
                      <FieldError message={fieldErrors[`socials.${key}`]} />
                    </label>
                  ))}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">FAQ</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={saving || (form.faq?.length || 0) >= 12}
                      onClick={addFaq}
                    >
                      Add FAQ
                    </Button>
                  </div>
                  <FieldError message={fieldErrors.faq} />
                  {(form.faq || []).map((item, index) => (
                    <div
                      key={`faq-${index}`}
                      className="grid gap-2 rounded-md border border-border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="grid flex-1 gap-1.5 text-sm font-medium">
                          Question
                          <Input
                            value={item.question}
                            onChange={onFaqChange(index, "question")}
                            disabled={saving}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove FAQ"
                          disabled={saving}
                          onClick={() => removeFaq(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <label className="grid gap-1.5 text-sm font-medium">
                        Answer
                        <Textarea
                          value={item.answer}
                          onChange={onFaqChange(index, "answer")}
                          rows={3}
                          disabled={saving}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <label className="grid gap-1.5 text-sm font-medium">
                  Anything else
                  <Textarea
                    value={form.extraNotes}
                    onChange={onChange("extraNotes")}
                    rows={4}
                    disabled={saving}
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                disabled={saving || uploading}
                onClick={onBack}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
            ) : null}
            <Button type="submit" disabled={saving || uploading} size="lg">
              {saving
                ? step === TOTAL_STEPS
                  ? "Submitting…"
                  : "Saving…"
                : step === TOTAL_STEPS
                  ? (
                      <>
                        Submit website details
                        <Check className="size-4" />
                      </>
                    )
                  : (
                      <>
                        Save and Continue
                        <ArrowRight className="size-4" />
                      </>
                    )}
            </Button>
          </div>
        </form>

        <SetupSidebar
          step={step}
          furthestStep={furthestStep}
          priorityUntil={intake?.priorityUntil}
          priorityActive={Boolean(intake?.priorityActive)}
          onSelectStep={(nextStep) => {
            setFieldErrors({});
            setStep(nextStep);
          }}
        />
        </div>
      )}

      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmCopy?.title}</DialogTitle>
            <DialogDescription>{confirmCopy?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button type="button" onClick={runConfirmAction}>
              {confirmCopy?.confirmLabel || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
