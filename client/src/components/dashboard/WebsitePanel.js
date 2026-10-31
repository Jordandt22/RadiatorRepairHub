"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
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
  patchPartnerWebsiteIntakeImage,
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

const SOCIAL_PLATFORM_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

const MAX_SOCIAL_LINKS = SOCIAL_PLATFORM_OPTIONS.length;
const MAX_FAQ_ITEMS = 12;

/** Matches the Partner website template’s default FAQ. */
const DEFAULT_FAQ_ITEMS = [
  {
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "Walk-ins are welcome. If every bay is full we will still look at it and tell you when we can pull it in. Diagnostics and brake jobs are usually the same day or the next morning. Bigger jobs get a finish time before we keep the car.",
  },
  {
    question: "How do you decide what to repair?",
    answer:
      "We test first and show you what we found. You get a price before we start. If the job grows, we call before we keep going.",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring the vehicle, plus the year, make, and what it is doing. If a light is on, leave it on. A previous estimate helps if you have one. You do not need a diagnosis.",
  },
  {
    question: "Do you work on cars and light trucks?",
    answer:
      "Yes. Daily drivers and light trucks, domestic and import. We do not do bodywork, paint, or heavy diesel. If a job is outside the shop, we say so before we take it in.",
  },
  {
    question: "Is the work under warranty?",
    answer:
      "12-month workmanship on our labor. Parts carry the manufacturer's warranty. Ask at pickup if you want the labor warranty in writing.",
  },
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
  "reset-faq": {
    title: "Reset to recommended FAQ?",
    description:
      "This replaces your current FAQ with the template’s standard questions.",
    confirmLabel: "Reset FAQ",
  },
  "clear-faq": {
    title: "Clear FAQ?",
    description:
      "This removes all FAQ items. The site will use the template’s generic FAQ until you add questions again.",
    confirmLabel: "Clear FAQ",
  },
};

function socialsToRows(socials) {
  if (Array.isArray(socials)) {
    const seen = new Set();
    return socials
      .map((item) => ({
        platform: String(item?.platform || "").toLowerCase(),
        url: String(item?.url || ""),
      }))
      .filter((item) => {
        if (!SOCIAL_PLATFORM_OPTIONS.some((opt) => opt.value === item.platform)) {
          return false;
        }
        if (seen.has(item.platform)) return false;
        seen.add(item.platform);
        return true;
      });
  }
  if (!socials || typeof socials !== "object") return [];
  return SOCIAL_PLATFORM_OPTIONS.map(({ value }) => ({
    platform: value,
    url: String(socials[value] || ""),
  })).filter((item) => item.url.trim());
}

function socialsRowsToObject(rows = []) {
  const out = Object.fromEntries(
    SOCIAL_PLATFORM_OPTIONS.map(({ value }) => [value, ""])
  );
  for (const row of Array.isArray(rows) ? rows : []) {
    const platform = String(row?.platform || "").toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(out, platform)) continue;
    if (out[platform]) continue;
    out[platform] = String(row?.url || "").trim();
  }
  return out;
}

const MAX_PROCESS_STEPS = 5;
const MIN_SERVICES_REQUIRED = 4;
const MAX_SERVICES = 20;
const MIN_GALLERY_PHOTOS = 4;
const MAX_GALLERY_PHOTOS = 10;
const MAX_IMAGE_CAPTION = 120;
const CAPTION_DEBOUNCE_MS = 400;
const DEFAULT_ACCENT_PREVIEW = "#E31B16";

const THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const ACCENT_PRESETS = [
  "#E31B16",
  "#0F766E",
  "#1D4ED8",
  "#B45309",
  "#7C3AED",
  "#111827",
];

function normalizeImageCaption(value) {
  return String(value || "")
    .trim()
    .slice(0, MAX_IMAGE_CAPTION);
}

function expandShortHex(value) {
  const match = /^#([0-9A-Fa-f]{3})$/.exec(value);
  if (!match) return value;
  const [r, g, b] = match[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
}

function hexForColorInput(value) {
  const raw = String(value || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(raw)) return expandShortHex(raw);
  return DEFAULT_ACCENT_PREVIEW;
}

function captionsMapFromImages(images = []) {
  const map = new Map();
  for (const image of Array.isArray(images) ? images : []) {
    if (!image?.imageId) continue;
    map.set(image.imageId, normalizeImageCaption(image.caption));
  }
  return map;
}
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
  mediaUsageConsent: false,
  description: "",
  yearsOfService: "",
  services: EMPTY_SERVICES(),
  newCustomerProcess: DEFAULT_PROCESS_STEPS.map((text) => ({ text })),
  theme: "dark",
  accentColor: "",
  socials: [],
  faq: DEFAULT_FAQ_ITEMS.map((item) => ({ ...item })),
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
  const [lightbox, setLightbox] = useState(null);
  const lastInitialIdRef = useRef("");
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const savedCaptionsRef = useRef(new Map());
  const captionTimersRef = useRef(new Map());
  const captionInFlightRef = useRef(new Set());
  const formRef = useRef(form);
  const selectedBusinessRef = useRef(null);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    setFurthestStep((prev) => Math.max(prev, step));
  }, [step]);

  useEffect(() => {
    return () => {
      for (const timer of captionTimersRef.current.values()) {
        clearTimeout(timer);
      }
      captionTimersRef.current.clear();
    };
  }, []);

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

  useEffect(() => {
    selectedBusinessRef.current = selectedBusiness;
  }, [selectedBusiness]);

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
      savedCaptionsRef.current = new Map();
      for (const timer of captionTimersRef.current.values()) clearTimeout(timer);
      captionTimersRef.current.clear();
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setFieldErrors({});
    for (const timer of captionTimersRef.current.values()) clearTimeout(timer);
    captionTimersRef.current.clear();
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
        const nextImages = Array.isArray(payload.images) ? payload.images : [];
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
          socials: socialsToRows(payload.socials),
          faq:
            Array.isArray(payload.faq) && payload.faq.length > 0
              ? payload.faq
              : DEFAULT_FAQ_ITEMS.map((item) => ({ ...item })),
          images: nextImages,
          newCustomerProcess: normalizeProcessSteps(payload.newCustomerProcess),
          mediaUsageConsent: Boolean(nextIntake?.mediaUsageConsented),
        });
        savedCaptionsRef.current = captionsMapFromImages(nextImages);
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

  const addSocialLink = () => {
    setForm((prev) => {
      const rows = Array.isArray(prev.socials) ? prev.socials : [];
      if (rows.length >= MAX_SOCIAL_LINKS) return prev;
      const used = new Set(rows.map((row) => row.platform));
      const nextPlatform = SOCIAL_PLATFORM_OPTIONS.find(
        (option) => !used.has(option.value)
      )?.value;
      if (!nextPlatform) return prev;
      return {
        ...prev,
        socials: [...rows, { platform: nextPlatform, url: "" }],
      };
    });
    clearFieldError("socials");
  };

  const updateSocialLink = (index, field, value) => {
    setForm((prev) => {
      const rows = [...(prev.socials || [])];
      if (!rows[index]) return prev;
      if (field === "platform") {
        const platform = String(value || "").toLowerCase();
        const taken = rows.some(
          (row, i) => i !== index && row.platform === platform
        );
        if (taken) return prev;
        rows[index] = { ...rows[index], platform };
      } else {
        rows[index] = { ...rows[index], url: value };
      }
      return { ...prev, socials: rows };
    });
    setFieldErrors((prev) => {
      if (!prev.socials && !Object.keys(prev).some((key) => key.startsWith("socials."))) {
        return prev;
      }
      const next = { ...prev };
      delete next.socials;
      delete next.form;
      for (const key of Object.keys(next)) {
        if (key.startsWith("socials.")) delete next[key];
      }
      return next;
    });
  };

  const removeSocialLink = (index) => {
    setForm((prev) => ({
      ...prev,
      socials: (prev.socials || []).filter((_, i) => i !== index),
    }));
    clearFieldError("socials");
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
      socials: Object.prototype.hasOwnProperty.call(payload, "socials")
        ? socialsToRows(payload.socials)
        : prev.socials,
      faq: Array.isArray(payload.faq) ? payload.faq : prev.faq,
      images: Array.isArray(payload.images) ? payload.images : prev.images,
      logo: payload.logo ?? prev.logo,
      newCustomerProcess: Object.prototype.hasOwnProperty.call(
        payload,
        "newCustomerProcess"
      )
        ? normalizeProcessSteps(payload.newCustomerProcess)
        : prev.newCustomerProcess,
      mediaUsageConsent: Boolean(nextIntake.mediaUsageConsented),
    }));
    if (Array.isArray(payload.images)) {
      savedCaptionsRef.current = captionsMapFromImages(payload.images);
    }
    if (syncStep && nextIntake.currentStep) {
      setStep(
        Math.min(TOTAL_STEPS, Math.max(1, Number(nextIntake.currentStep)))
      );
    }
  };

  const saveCaption = async (imageId, rawCaption) => {
    const business = selectedBusinessRef.current;
    if (!business?.is_partner || uploading) return true;
    const caption = normalizeImageCaption(rawCaption);
    if (savedCaptionsRef.current.get(imageId) === caption) return true;
    if (captionInFlightRef.current.has(imageId)) return false;

    captionInFlightRef.current.add(imageId);
    const { data, error, status } = await patchPartnerWebsiteIntakeImage(
      business.id,
      imageId,
      { caption }
    );
    captionInFlightRef.current.delete(imageId);

    if (status === 422 && error?.message && typeof error.message === "object") {
      setFieldErrors(error.message);
      return false;
    }
    if (error || status >= 400) {
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to save photo caption."
      );
      return false;
    }

    savedCaptionsRef.current.set(imageId, caption);
    if (data?.intake) applyIntake(data.intake);
    else {
      setForm((prev) => ({
        ...prev,
        images: (prev.images || []).map((image) =>
          image.imageId === imageId ? { ...image, caption } : image
        ),
      }));
    }
    return true;
  };

  const clearCaptionTimer = (imageId) => {
    const timer = captionTimersRef.current.get(imageId);
    if (!timer) return;
    clearTimeout(timer);
    captionTimersRef.current.delete(imageId);
  };

  const scheduleCaptionSave = (imageId, caption) => {
    clearCaptionTimer(imageId);
    const timer = setTimeout(() => {
      captionTimersRef.current.delete(imageId);
      void saveCaption(imageId, caption);
    }, CAPTION_DEBOUNCE_MS);
    captionTimersRef.current.set(imageId, timer);
  };

  const flushCaptionSave = async (imageId) => {
    clearCaptionTimer(imageId);
    const image = (formRef.current.images || []).find(
      (item) => item.imageId === imageId
    );
    if (!image) return true;
    return saveCaption(imageId, image.caption);
  };

  const flushPendingCaptions = async () => {
    const pendingIds = new Set([
      ...captionTimersRef.current.keys(),
      ...[...(formRef.current.images || [])]
        .filter(
          (image) =>
            image?.imageId &&
            savedCaptionsRef.current.get(image.imageId) !==
              normalizeImageCaption(image.caption)
        )
        .map((image) => image.imageId),
    ]);
    for (const imageId of pendingIds) {
      clearCaptionTimer(imageId);
    }
    await Promise.all(
      [...pendingIds].map((imageId) => {
        const image = (formRef.current.images || []).find(
          (item) => item.imageId === imageId
        );
        return saveCaption(imageId, image?.caption);
      })
    );
  };

  const onCaptionChange = (imageId, caption) => {
    const nextCaption = caption.slice(0, MAX_IMAGE_CAPTION);
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).map((image) =>
        image.imageId === imageId
          ? { ...image, caption: nextCaption }
          : image
      ),
    }));
    scheduleCaptionSave(imageId, nextCaption);
  };

  const onCaptionBlur = (imageId) => {
    void flushCaptionSave(imageId);
  };

  const saveStep = async (currentStep, { soft = false } = {}) => {
    if (!selectedBusiness?.is_partner || saving) return false;
    await flushPendingCaptions();
    setSaving(true);
    setFieldErrors({});
    const currentForm = formRef.current;
    const { data, error, status } = await patchPartnerWebsiteIntake(
      selectedBusiness.id,
      {
        ...currentForm,
        socials: socialsRowsToObject(currentForm.socials),
        step: currentStep,
        soft,
        mediaUsageConsent: Boolean(currentForm.mediaUsageConsent),
      }
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
      {
        ...form,
        socials: socialsRowsToObject(form.socials),
        mediaUsageConsent: Boolean(form.mediaUsageConsent),
      }
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

  const onMediaConsentChange = async (checked) => {
    const previous = Boolean(form.mediaUsageConsent);
    setForm((prev) => ({ ...prev, mediaUsageConsent: checked }));
    clearFieldError("mediaUsageConsent");
    if (!selectedBusiness?.is_partner || saving) return;

    setSaving(true);
    const { data, error, status } = await patchPartnerWebsiteIntake(
      selectedBusiness.id,
      {
        mediaUsageConsent: checked,
        consentOnly: true,
        soft: true,
      }
    );
    setSaving(false);
    if (status === 422 && error?.message && typeof error.message === "object") {
      setForm((prev) => ({ ...prev, mediaUsageConsent: previous }));
      setFieldErrors(error.message);
      return;
    }
    if (error || status >= 400) {
      setForm((prev) => ({ ...prev, mediaUsageConsent: previous }));
      showCustomError(
        typeof error?.message === "string"
          ? error.message
          : "Unable to save photo permission."
      );
      return;
    }
    applyIntake(data?.intake);
  };

  const onLogoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedBusiness) return;
    if (!form.mediaUsageConsent) {
      setFieldErrors((prev) => ({
        ...prev,
        mediaUsageConsent:
          "Confirm permission to store and use these photos before uploading.",
      }));
      return;
    }
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
    if (!form.mediaUsageConsent) {
      setFieldErrors((prev) => ({
        ...prev,
        mediaUsageConsent:
          "Confirm permission to store and use these photos before uploading.",
      }));
      return;
    }
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
    clearCaptionTimer(imageId);
    savedCaptionsRef.current.delete(imageId);
    setUploading(true);
    if (lightbox?.url) {
      const match = (form.images || []).find(
        (image) => image.imageId === imageId
      );
      if (match?.url && match.url === lightbox.url) setLightbox(null);
    }
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

  const applyResetFaqToRecommended = () => {
    setForm((prev) => ({
      ...prev,
      faq: DEFAULT_FAQ_ITEMS.map((item) => ({ ...item })),
    }));
    clearFieldError("faq");
  };

  const applyClearFaq = () => {
    setForm((prev) => ({
      ...prev,
      faq: [],
    }));
    clearFieldError("faq");
  };

  const resetFaqToRecommended = () => {
    if (saving) return;
    setConfirmAction("reset-faq");
  };

  const clearFaqItems = () => {
    if (saving) return;
    if ((form.faq?.length || 0) === 0) return;
    setConfirmAction("clear-faq");
  };

  const closeConfirm = () => setConfirmAction(null);

  const runConfirmAction = () => {
    if (confirmAction === "restore-hours") applyRestoreListingHours();
    else if (confirmAction === "reset-process") applyResetProcessToRecommended();
    else if (confirmAction === "clear-process") applyClearProcessSteps();
    else if (confirmAction === "reset-faq") applyResetFaqToRecommended();
    else if (confirmAction === "clear-faq") applyClearFaq();
    setConfirmAction(null);
  };

  const confirmCopy = confirmAction ? CONFIRM_ACTIONS[confirmAction] : null;

  const addFaq = () => {
    setForm((prev) => {
      if ((prev.faq?.length || 0) >= MAX_FAQ_ITEMS) return prev;
      return {
        ...prev,
        faq: [...(prev.faq || []), { question: "", answer: "" }],
      };
    });
    clearFieldError("faq");
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
    clearFieldError("faq");
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

                <div className="relative space-y-6">
                  {uploading ? (
                    <div
                      className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[1px]"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                        <Loader2 className="size-4 animate-spin" />
                        Updating photos…
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <label className="flex items-start gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-border text-primary focus:ring-ring"
                        checked={Boolean(form.mediaUsageConsent)}
                        disabled={saving || uploading}
                        onChange={(e) => onMediaConsentChange(e.target.checked)}
                      />
                      <span>
                        I grant Radiator Repair Hub permission to store these
                        photos and use them on my Partner website and related
                        materials.
                        <span className="text-destructive"> *</span>
                      </span>
                    </label>
                    <FieldError message={fieldErrors.mediaUsageConsent} />
                  </div>

                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Logo</span>
                    <p className="text-sm text-muted-foreground">
                      Optional — JPEG, PNG, or WebP up to 5 MB. Images are
                      compressed and metadata is removed before storage.
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
                        <button
                          type="button"
                          className="rounded-md border border-border bg-muted p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          disabled={uploading}
                          onClick={() =>
                            setLightbox({
                              url: form.logo.url,
                              alt: "Logo preview",
                            })
                          }
                          aria-label="View logo larger"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={form.logo.url}
                            alt="Logo preview"
                            className="size-16 object-contain"
                          />
                        </button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          saving ||
                          uploading ||
                          !form.mediaUsageConsent
                        }
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
                      Gallery photos{" "}
                      <span className="text-destructive">*</span>
                    </span>
                    <p className="text-sm text-muted-foreground">
                      JPEG, PNG, or WebP up to 5 MB each. Photos are compressed
                      and metadata is removed before storage. Captions are
                      optional.
                    </p>
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
                    <div className="space-y-3">
                      {(form.images || []).map((image, index) => {
                        const caption = String(image.caption || "");
                        return (
                          <div
                            key={image.imageId}
                            className="flex flex-wrap items-start gap-3 rounded-md border border-border p-3"
                          >
                            <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border">
                              <button
                                type="button"
                                className="size-full p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                disabled={uploading}
                                onClick={() =>
                                  setLightbox({
                                    url: image.url,
                                    alt: caption || `Gallery photo ${index + 1}`,
                                    caption: caption || "",
                                  })
                                }
                                aria-label={`View gallery photo ${index + 1} larger`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={image.url}
                                  alt={caption || ""}
                                  className="size-full object-cover"
                                />
                              </button>
                              <button
                                type="button"
                                className="absolute right-1 top-1 rounded bg-background/90 p-1 text-destructive"
                                aria-label="Remove image"
                                disabled={uploading}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onDeleteImage(image.imageId);
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                            <label className="grid min-w-[12rem] flex-1 gap-1.5 text-sm font-medium">
                              Caption{" "}
                              <span className="font-normal text-muted-foreground">
                                (optional)
                              </span>
                              <Input
                                value={caption}
                                maxLength={MAX_IMAGE_CAPTION}
                                placeholder="e.g. Front bay"
                                disabled={saving || uploading}
                                onChange={(e) =>
                                  onCaptionChange(
                                    image.imageId,
                                    e.target.value
                                  )
                                }
                                onBlur={() => onCaptionBlur(image.imageId)}
                              />
                              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                                {caption.length}/{MAX_IMAGE_CAPTION}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit"
                      disabled={
                        saving ||
                        uploading ||
                        !form.mediaUsageConsent ||
                        (form.images?.length || 0) >= MAX_GALLERY_PHOTOS
                      }
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <Upload className="size-4" />
                      Add photos
                    </Button>
                    <FieldError message={fieldErrors.images} />
                  </div>
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
                  <SelectMenu
                    id="partner-intake-theme"
                    label="Theme"
                    value={form.theme === "light" ? "light" : "dark"}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        theme: value === "light" ? "light" : "dark",
                      }));
                      clearFieldError("theme");
                    }}
                    options={THEME_OPTIONS}
                    disabled={saving}
                    triggerClassName="h-10"
                  />
                  <div className="grid gap-1.5">
                    <span className="text-sm font-medium">Accent color</span>
                    <p className="text-sm text-muted-foreground">
                      Optional brand color for buttons and highlights.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={`relative size-10 shrink-0 overflow-hidden rounded-md border border-border shadow-sm ${
                          saving
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                        title="Pick accent color"
                      >
                        <span
                          className="absolute inset-0"
                          style={{
                            backgroundColor: hexForColorInput(form.accentColor),
                          }}
                          aria-hidden="true"
                        />
                        <input
                          type="color"
                          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                          value={hexForColorInput(form.accentColor)}
                          disabled={saving}
                          aria-label="Accent color picker"
                          onChange={(event) => {
                            const next = String(event.target.value || "")
                              .trim()
                              .toUpperCase();
                            setForm((prev) => ({
                              ...prev,
                              accentColor: next,
                            }));
                            clearFieldError("accentColor");
                          }}
                        />
                      </label>
                      <Input
                        value={form.accentColor}
                        onChange={onChange("accentColor")}
                        placeholder="#E31B16"
                        disabled={saving}
                        className="min-w-[8rem] flex-1 font-mono uppercase"
                        aria-invalid={Boolean(fieldErrors.accentColor)}
                      />
                      {form.accentColor ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={saving}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              accentColor: "",
                            }));
                            clearFieldError("accentColor");
                          }}
                        >
                          Clear
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ACCENT_PRESETS.map((preset) => {
                        const selected =
                          hexForColorInput(form.accentColor) === preset &&
                          Boolean(form.accentColor);
                        return (
                          <button
                            key={preset}
                            type="button"
                            disabled={saving}
                            title={preset}
                            aria-label={`Use accent ${preset}`}
                            aria-pressed={selected}
                            className={`size-7 rounded-full border border-border transition-[transform,box-shadow] disabled:opacity-50 ${
                              selected
                                ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: preset }}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                accentColor: preset,
                              }));
                              clearFieldError("accentColor");
                            }}
                          />
                        );
                      })}
                    </div>
                    <FieldError message={fieldErrors.accentColor} />
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <span className="text-sm font-medium">Social links</span>
                      <LimitProgress
                        current={form.socials?.length || 0}
                        max={MAX_SOCIAL_LINKS}
                        min={0}
                        unitLabel="links"
                      />
                      <p className="text-sm text-muted-foreground">
                        Optional — add the profiles you want on the site. Each
                        platform can only be used once.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        saving ||
                        (form.socials?.length || 0) >= MAX_SOCIAL_LINKS
                      }
                      onClick={addSocialLink}
                    >
                      <Plus className="size-4" />
                      Add link
                    </Button>
                  </div>
                  <FieldError message={fieldErrors.socials} />
                  <div className="space-y-2">
                    {(form.socials || []).length === 0 ? (
                      <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                        No social links yet. Add Facebook, Instagram, YouTube,
                        or TikTok if you want them on the site.
                      </p>
                    ) : null}
                    {(form.socials || []).map((item, index) => {
                      const usedElsewhere = new Set(
                        (form.socials || [])
                          .filter((_, i) => i !== index)
                          .map((row) => row.platform)
                      );
                      const platformOptions = SOCIAL_PLATFORM_OPTIONS.filter(
                        (option) =>
                          option.value === item.platform ||
                          !usedElsewhere.has(option.value)
                      );
                      return (
                        <div
                          key={`social-${index}-${item.platform}`}
                          className="flex flex-wrap items-end gap-2 rounded-md border border-border p-3"
                        >
                          <SelectMenu
                            className="w-full sm:w-44"
                            triggerClassName="h-10"
                            label="Platform"
                            aria-label={`Social platform ${index + 1}`}
                            value={item.platform}
                            onValueChange={(value) =>
                              updateSocialLink(index, "platform", value)
                            }
                            options={platformOptions}
                            disabled={saving}
                          />
                          <label className="grid min-w-[12rem] flex-1 gap-1.5 text-sm font-medium">
                            Profile URL
                            <Input
                              value={item.url}
                              onChange={(event) =>
                                updateSocialLink(
                                  index,
                                  "url",
                                  event.target.value
                                )
                              }
                              placeholder="https://"
                              disabled={saving}
                              aria-invalid={Boolean(
                                fieldErrors[`socials.${item.platform}`]
                              )}
                            />
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${item.platform} link`}
                            disabled={saving}
                            onClick={() => removeSocialLink(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                          <FieldError
                            message={fieldErrors[`socials.${item.platform}`]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <span className="text-sm font-medium">FAQ</span>
                      <LimitProgress
                        current={form.faq?.length || 0}
                        max={MAX_FAQ_ITEMS}
                        min={0}
                        unitLabel="questions"
                      />
                      <p className="text-sm text-muted-foreground">
                        Optional Q&amp;A for the site. We’ve prefilled the
                        template’s standard questions — edit them, add more, or
                        clear to use the generic FAQ as-is.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={resetFaqToRecommended}
                      >
                        <RotateCcw className="size-4" />
                        Reset to recommended
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={saving || (form.faq?.length || 0) === 0}
                        onClick={clearFaqItems}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          saving || (form.faq?.length || 0) >= MAX_FAQ_ITEMS
                        }
                        onClick={addFaq}
                      >
                        <Plus className="size-4" />
                        Add question
                      </Button>
                    </div>
                  </div>
                  <FieldError message={fieldErrors.faq} />
                  <div className="space-y-2">
                    {(form.faq || []).length === 0 ? (
                      <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                        No custom FAQ. We’ll use the template’s generic FAQ on
                        the site. Use Reset to recommended to bring the default
                        questions back.
                      </p>
                    ) : null}
                    {(form.faq || []).map((item, index) => (
                      <div
                        key={`faq-${index}`}
                        className="grid gap-2 rounded-md border border-border p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-start gap-2">
                            <span
                              className="mt-7 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                              aria-hidden="true"
                            >
                              {index + 1}
                            </span>
                            <label className="grid min-w-0 flex-1 gap-1.5 text-sm font-medium">
                              Question
                              <Input
                                value={item.question}
                                onChange={onFaqChange(index, "question")}
                                disabled={saving}
                                placeholder="e.g. Do I need an appointment?"
                              />
                            </label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-7"
                            aria-label={`Remove FAQ ${index + 1}`}
                            disabled={saving}
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <label className="grid gap-1.5 pl-9 text-sm font-medium">
                          Answer
                          <Textarea
                            value={item.answer}
                            onChange={onFaqChange(index, "answer")}
                            rows={3}
                            disabled={saving}
                            placeholder="Short answer customers will see on the site."
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="grid gap-1.5 text-sm font-medium">
                  Extra notes
                  <Textarea
                    value={form.extraNotes}
                    onChange={onChange("extraNotes")}
                    rows={4}
                    disabled={saving}
                    placeholder="Anything else we should know — awards, certificates, warranties, special equipment, or other details for the site."
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
            <Button
              type="submit"
              disabled={saving || uploading}
              size="lg"
              className={
                step === TOTAL_STEPS
                  ? "border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90"
                  : undefined
              }
            >
              {saving
                ? step === TOTAL_STEPS
                  ? "Submitting…"
                  : "Saving…"
                : step === TOTAL_STEPS
                  ? (
                      <>
                        <Check className="size-4" />
                        Submit
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

      <Dialog
        open={Boolean(lightbox?.url)}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent
          className="gap-3 overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-4xl"
          overlayClassName="bg-black/70"
          closeButtonClassName="bg-background/90 text-foreground"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Photo preview</DialogTitle>
            <DialogDescription>
              Enlarged view of the selected photo.
            </DialogDescription>
          </DialogHeader>
          {lightbox?.url ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.url}
                alt={lightbox.alt || "Photo preview"}
                className="max-h-[80vh] w-full rounded-lg bg-black/40 object-contain"
              />
              {lightbox.caption ? (
                <p className="px-1 text-center text-sm text-background">
                  {lightbox.caption}
                </p>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
