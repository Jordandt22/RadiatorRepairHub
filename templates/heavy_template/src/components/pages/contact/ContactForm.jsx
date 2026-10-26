"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, SendHorizontal } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";
import { btnPrimary, muted } from "@/lib/ui";
import { FieldError } from "./FieldError";

const fieldClass =
  "min-h-12 rounded-card border-2 border-line/50 bg-surface px-3 py-2.5 font-inherit text-ink placeholder:text-ink-muted placeholder:opacity-100 outline-none! hover:border-accent/20 focus:border-accent-text focus:hover:border-accent-text transition-colors duration-200";

function ServiceSelect({
  id,
  services,
  placeholder,
  name,
  disabled,
  className,
  describedBy,
  invalid,
  onValueChange,
  inputRef,
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listId = `${id}-list`;
  const selectedIndex = services.findIndex((item) => item.title === value);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const option = document.getElementById(`${id}-option-${active}`);
    option?.scrollIntoView({ block: "nearest" });
  }, [active, id, open]);

  function choose(next) {
    setValue(next);
    setOpen(false);
    onValueChange?.();
  }

  function onKeyDown(event) {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setActive(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      } else {
        setActive((index) => Math.min(services.length - 1, index + 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActive(selectedIndex >= 0 ? selectedIndex : services.length - 1);
        setOpen(true);
      } else {
        setActive((index) => Math.max(0, index - 1));
      }
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActive(services.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(services[active].title);
      else {
        setActive(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={inputRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        className={`${className} flex w-full cursor-pointer items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60`}
        onClick={(event) => {
          if (event.detail === 0) return;
          setActive(selectedIndex >= 0 ? selectedIndex : 0);
          setOpen((current) => !current);
        }}
        onKeyDown={onKeyDown}
      >
        <span className={value ? "text-ink" : "text-ink-muted"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180 text-accent-text" : "text-ink-muted"}`}
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={placeholder}
          className="absolute top-full z-30 mt-1 max-h-72 w-full list-none overflow-auto border border-line bg-surface p-1 shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
        >
          {services.map((item, index) => {
            const selected = item.title === value;
            const highlighted = index === active;
            return (
              <li
                key={item.slug ?? item.title}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={selected}
                className={`cursor-pointer px-3 py-2 text-sm ${highlighted ? "bg-accent/15" : ""} ${selected ? "font-medium text-accent-text" : "text-ink"}`}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(item.title);
                }}
              >
                {item.title}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

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
  const email = fields.email.trim();
  if (email.length > 254) errors.email = copy.emailMax;
  else if (email && !isValidEmail(email)) errors.email = copy.email;
  if (requireService && !fields.service.trim()) errors.service = copy.service;
  const vehicle = fields.vehicle.trim();
  if (!vehicle) errors.vehicle = copy.vehicle;
  else if (vehicle.length > 120) errors.vehicle = copy.vehicleMax;
  const issue = fields.issue.trim();
  if (issue.length < 5) errors.issue = copy.issue;
  else if (issue.length > 1000) errors.issue = copy.issueMax;
  return errors;
}

export function ContactForm() {
  const config = getConfig();
  const { shop, contact, services } = config;
  const [status, setStatus] = useState("idle");
  const [fieldErrors, setFieldErrors] = useState({});
  const errorRef = useRef(null);
  const successRef = useRef(null);
  const fieldRefs = useRef({});
  const submittingRef = useRef(false);
  const lastSubmitAtRef = useRef(0);
  const focusErrorsRef = useRef(false);
  const requireService = Boolean(services?.length);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

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
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="bg-accent/10 p-4 rounded-card border-2 border-accent/20"
      >
        <p className="mb-4 text-accent-text font-semibold">{CHROME.formSuccess}</p>
        <a className={btnPrimary} href={telHref(shop)}>
          {callLabel(shop)}
        </a>
      </div>
    );
  }

  const submitting = status === "submitting";
  const inputClass = (name, extra = "") =>
    `${fieldClass} ${extra} ${fieldErrors[name] ? "border-accent hover:border-accent" : ""}`.trim();

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

  const serviceField = requireService ? fieldProps("service") : null;

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
          maxLength={254}
          placeholder={CHROME.placeholders.email}
        />
        <FieldError id="email-error" message={fieldErrors.email} />
      </label>
      {requireService ? (
        <div className="grid gap-1 text-sm font-medium">
          <label htmlFor="contact-service">Service</label>
          <ServiceSelect
            id="contact-service"
            services={services}
            placeholder={CHROME.placeholders.service}
            inputRef={serviceField.ref}
            className={serviceField.className}
            name={serviceField.name}
            disabled={serviceField.disabled}
            invalid={serviceField["aria-invalid"]}
            describedBy={serviceField["aria-describedby"]}
            onValueChange={serviceField.onChange}
          />
          <FieldError id="service-error" message={fieldErrors.service} />
        </div>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        Vehicle model
        <input
          {...fieldProps("vehicle")}
          type="text"
          autoComplete="off"
          aria-required="true"
          maxLength={120}
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
          maxLength={1000}
          placeholder={CHROME.placeholders.issue}
        />
        <FieldError id="issue-error" message={fieldErrors.issue} />
      </label>
      {status === "error" ? (
        <p
          className="m-0 text-sm font-medium text-accent-text"
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
