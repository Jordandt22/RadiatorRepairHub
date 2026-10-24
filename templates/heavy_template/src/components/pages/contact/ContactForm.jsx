"use client";
import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";
import { btnPrimary, muted } from "@/lib/ui";
import { FieldError } from "./FieldError";

const fieldClass =
  "min-h-12 rounded-card border border-line bg-surface px-3 py-2.5 font-inherit text-ink placeholder:text-ink-muted placeholder:opacity-100 ring-0! outline-none! focus:border-accent transition-colors duration-200";

const SUBMIT_COOLDOWN_MS = 2000;
const FIELD_ORDER = ["name", "phone", "email", "service", "vehicle", "issue"];

const isValidPhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function validateFields(fields, { requireService }) {
  const errors = {};
  const copy = CHROME.fieldErrors;
  if (fields.name.trim().length < 2) errors.name = copy.name;
  if (!fields.phone.trim()) errors.phone = copy.phoneRequired;
  else if (!isValidPhone(fields.phone)) errors.phone = copy.phone;
  if (fields.email.trim() && !isValidEmail(fields.email.trim())) {
    errors.email = copy.email;
  }
  if (requireService && !fields.service.trim()) errors.service = copy.service;
  if (!fields.vehicle.trim()) errors.vehicle = copy.vehicle;
  if (fields.issue.trim().length < 5) errors.issue = copy.issue;
  return errors;
}

export function ContactForm() {
  const config = getConfig();
  const { shop, contact, services } = config;
  const [status, setStatus] = useState("idle");
  const [fieldErrors, setFieldErrors] = useState({});
  const errorRef = useRef(null);
  const fieldRefs = useRef({});
  const submittingRef = useRef(false);
  const lastSubmitAtRef = useRef(0);
  const focusErrorsRef = useRef(false);
  const requireService = Boolean(services?.length);

  useEffect(() => {
    if (!focusErrorsRef.current) return;
    focusErrorsRef.current = false;
    const first = FIELD_ORDER.find((key) => fieldErrors[key]);
    if (first) {
      fieldRefs.current[first]?.focus();
      return;
    }
    if (status === "error") errorRef.current?.focus();
  }, [fieldErrors, status]);

  function clearFieldError(name) {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;
    const now = Date.now();
    if (now - lastSubmitAtRef.current < SUBMIT_COOLDOWN_MS) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const fields = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      service: String(data.get("service") ?? ""),
      vehicle: String(data.get("vehicle") ?? ""),
      issue: String(data.get("issue") ?? ""),
    };
    const errors = validateFields(fields, { requireService });
    if (Object.keys(errors).length) {
      focusErrorsRef.current = true;
      setFieldErrors(errors);
      setStatus("idle");
      return;
    }

    lastSubmitAtRef.current = now;
    submittingRef.current = true;
    setFieldErrors({});
    setStatus("submitting");
    const apiBase = process.env.NEXT_PUBLIC_API_URI?.replace(/\/$/, "");
    try {
      const siteKey = process.env.NEXT_PUBLIC_TEMPLATE_API_KEY?.trim();
      if (!apiBase || (!siteKey && !contact.siteId)) throw new Error("send failed");
      const res = await fetch(`${apiBase}/template-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(siteKey ? { "X-Site-Key": siteKey } : {}),
        },
        body: JSON.stringify({
          ...(siteKey ? {} : { siteId: contact.siteId }),
          ...fields,
          company: String(data.get("company") ?? ""),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error?.message;
        if (res.status === 422 && message && typeof message === "object") {
          focusErrorsRef.current = true;
          setFieldErrors(message);
          setStatus("idle");
          return;
        }
        throw new Error("send failed");
      }
      setStatus("success");
    }
    catch {
      focusErrorsRef.current = true;
      setStatus("error");
    }
    finally {
      submittingRef.current = false;
    }
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="bg-accent/10 p-4 rounded-card border-2 border-accent/20">
        <p className="mb-4 text-accent font-semibold">{CHROME.formSuccess}</p>
        <a className={btnPrimary} href={telHref(shop)}>
          {callLabel(shop)}
        </a>
      </div>
    );
  }

  const submitting = status === "submitting";
  const inputClass = (name, extra = "") =>
    `${fieldClass} ${extra} ${fieldErrors[name] ? "border-accent" : ""}`.trim();

  function fieldProps(name) {
    const errorId = fieldErrors[name] ? `${name}-error` : undefined;
    return {
      ref: (node) => {
        fieldRefs.current[name] = node;
      },
      className: inputClass(name, name === "issue" ? "min-h-32 resize-y" : ""),
      name,
      disabled: submitting,
      "aria-invalid": fieldErrors[name] ? true : undefined,
      "aria-describedby": errorId,
      onChange: () => clearFieldError(name),
    };
  }

  return (
    <form className="relative grid gap-3.5" onSubmit={onSubmit} noValidate>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Name
        <input
          {...fieldProps("name")}
          type="text"
          autoComplete="name"
          aria-required="true"
          placeholder={CHROME.placeholders.name}
        />
        <FieldError id="name-error" message={fieldErrors.name} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Phone
        <input
          {...fieldProps("phone")}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          aria-required="true"
          placeholder={CHROME.placeholders.phone}
        />
        <FieldError id="phone-error" message={fieldErrors.phone} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Email
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          spellCheck={false}
          placeholder={CHROME.placeholders.email}
        />
        <FieldError id="email-error" message={fieldErrors.email} />
      </label>
      {requireService ? (
        <label className="grid gap-1 text-sm font-medium">
          Service
          <select
            {...fieldProps("service")}
            aria-required="true"
            defaultValue=""
          >
            <option value="" disabled>
              {CHROME.placeholders.service}
            </option>
            {services.map((item) => (
              <option key={item.slug ?? item.title} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>
          <FieldError id="service-error" message={fieldErrors.service} />
        </label>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        Vehicle model
        <input
          {...fieldProps("vehicle")}
          type="text"
          autoComplete="off"
          aria-required="true"
          placeholder={CHROME.placeholders.vehicle}
        />
        <FieldError id="vehicle-error" message={fieldErrors.vehicle} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Describe the Issue
        <textarea
          {...fieldProps("issue")}
          autoComplete="off"
          aria-required="true"
          placeholder={CHROME.placeholders.issue}
        />
        <FieldError id="issue-error" message={fieldErrors.issue} />
      </label>
      {status === "error" ? (
        <p
          className="m-0 text-sm font-medium text-accent"
          ref={errorRef}
          tabIndex={-1}
          role="alert"
        >
          {CHROME.formError}
        </p>
      ) : null}
      <button
        className={`${btnPrimary} gap-2 disabled:opacity-60`}
        type="submit"
        disabled={submitting}
      >
        {CHROME.sendMessage}
        <SendHorizontal size={18} strokeWidth={2} aria-hidden />
      </button>
      <p className={muted}>{CHROME.formPrivacy}</p>
    </form>
  );
}
