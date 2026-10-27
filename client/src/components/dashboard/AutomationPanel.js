"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeftRight, ArrowRight, Car, Check, ChevronLeft, ChevronRight, Lock, Mail, Phone, Save, Search, Send, Star, User, Wrench, X } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import ReviewQrCode from "@/components/dashboard/ReviewQrCode";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/ToastProvider";
import {
  fetchReviewRequests,
  fetchWebsiteLeads,
  saveReviewMessageTemplate,
  sendReviewRequest,
} from "@/lib/api/reviewRequests";
import { FEATURED_YEARLY_PRICE_WITH_INTERVAL } from "@/lib/featuredPricing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  applyReviewMessageTemplate,
  defaultReviewMessageTemplate,
  googleReviewUrl,
  reviewEmailSubject,
  reviewMessageToTemplate,
  reviewSentByLine,
  reviewUnsubscribeLine,
} from "@/lib/reviewRequest";

const tabsTriggerClassNames =
  "px-4 cursor-pointer transition-colors duration-200";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function reviewFormErrors({ name, email, message }) {
  const next = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName) {
    next.name = "Enter the customer's name.";
  } else if (trimmedName.length > 120) {
    next.name = "Name must be 120 characters or fewer.";
  }

  if (!trimmedEmail) {
    next.email = "Enter the customer's email.";
  } else if (!isValidEmail(trimmedEmail)) {
    next.email = "Enter a valid email address.";
  } else if (trimmedEmail.length > 320) {
    next.email = "Email must be 320 characters or fewer.";
  }

  if (!trimmedMessage) {
    next.message = "Enter a message.";
  } else if (trimmedMessage.length > 2000) {
    next.message = "Message must be 2,000 characters or fewer.";
  }

  return next;
}

function errorText(error, fallback) {
  if (!error) return fallback;
  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }
  if (typeof error.message === "object" && error.message) {
    const first = Object.values(error.message).find(
      (value) => typeof value === "string" && value.trim()
    );
    if (first) return first;
  }
  return fallback;
}

function formatSentAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function FeaturedReviewLock({ business }) {
  const posthog = usePostHog();
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-400/50 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/25 dark:bg-amber-500/10">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Star className="size-5 fill-current" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading font-semibold text-foreground">
            Get more visibility with Featured
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Print a Google review code and email a review link to customers.
            Featured includes 20 review emails a month, up to 2 per address.{" "}
            {FEATURED_YEARLY_PRICE_WITH_INTERVAL}, cancel anytime.
          </p>
        </div>
      </div>
      <Link
        href={`/pricing?business=${encodeURIComponent(business.id)}`}
        className={buttonVariants({ className: "shrink-0" })}
        prefetch={false}
        onClick={() =>
          posthog?.capture("featured_cta_clicked", {
            source: "dashboard_automation",
            cta: "get_featured",
            business_id: business.id,
            business_slug: business.slug || undefined,
            business_name: business.title || undefined,
          })
        }
      >
        View Featured pricing
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function leadIssuePreview(issue) {
  return String(issue ?? "").replace(/\s+/g, " ").trim();
}

function leadTelHref(phone) {
  const digits = String(phone ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

function leadStatusLabel(status) {
  if (status === "review_sent") return "Review sent";
  return "New";
}

function leadStatusClass(status) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium";
  if (status === "review_sent") {
    return `${base} bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400`;
  }
  return `${base} bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400`;
}

const LEAD_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

const LEAD_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "review_sent", label: "Review sent" },
];

function leadDefaultReviewMessage(business, customerName, messageTemplate = null) {
  const saved =
    typeof messageTemplate === "string" && messageTemplate.trim()
      ? messageTemplate.trim()
      : typeof business?.review_message_template === "string" &&
        business.review_message_template.trim()
        ? business.review_message_template.trim()
        : defaultReviewMessageTemplate(business?.title);
  return applyReviewMessageTemplate(saved, customerName);
}

function LeadFollowUp({
  business,
  onCustomizeReview,
  onReviewSent,
  reloadKey = 0,
}) {
  const { showCustomSuccess, showCustomError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [services, setServices] = useState([]);
  const [openLeadIds, setOpenLeadIds] = useState(() => new Set());
  const [confirmLead, setConfirmLead] = useState(null);
  const [sendingLeadId, setSendingLeadId] = useState("");
  const queryRef = useRef("");
  const reviewUrl = googleReviewUrl(business.place_id);

  useEffect(() => {
    setSearch("");
    setQuery("");
    queryRef.current = "";
    setSort("newest");
    setStatus("all");
    setService("all");
    setServices([]);
    setOpenLeadIds(new Set());
    setConfirmLead(null);
    setSendingLeadId("");
    setPage(1);
  }, [business.id]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = search.trim();
      if (queryRef.current === next) return;
      queryRef.current = next;
      setQuery(next);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (!business?.is_partner) return undefined;
    let mounted = true;
    setLoading(true);
    setError("");
    fetchWebsiteLeads(business.id, { page, q: query, sort, status, service }).then(({ data, error: apiError }) => {
      if (!mounted) return;
      if (apiError) {
        setError(errorText(apiError, "Unable to load website leads."));
        setLeads([]);
        setTotalPages(1);
      } else {
        const nextTotalPages = Math.max(1, Number(data?.pagination?.totalPages) || 1);
        const nextServices = Array.isArray(data?.services) ? data.services : [];
        setServices(nextServices);
        if (page > nextTotalPages) {
          setPage(nextTotalPages);
        } else {
          setLeads(Array.isArray(data?.leads) ? data.leads : []);
          setTotalPages(nextTotalPages);
          setError("");
        }
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [business.id, business.is_partner, page, query, sort, status, service, reloadKey]);

  useEffect(() => {
    setOpenLeadIds(new Set());
  }, [page, query, sort, status, service]);

  useEffect(() => {
    if (service !== "all" && services.length > 0 && !services.includes(service)) {
      setService("all");
      setPage(1);
    }
  }, [service, services]);

  const closeConfirm = () => {
    if (sendingLeadId) return;
    setConfirmLead(null);
  };

  const sendDefaultReview = async () => {
    if (!confirmLead || sendingLeadId) return;
    if (!business.is_featured) {
      showCustomError("Review emails are included with a Featured listing.");
      return;
    }
    if (!reviewUrl) {
      showCustomError("This listing does not have a Google place ID yet.");
      return;
    }
    const customerName = String(confirmLead.customerName || "").trim();
    const customerEmail = String(confirmLead.customerEmail || "").trim();
    if (!customerEmail) {
      showCustomError("This lead has no email address.");
      return;
    }

    setSendingLeadId(confirmLead.id);
    let savedTemplate = null;
    const templateResult = await fetchReviewRequests(business.id, 1);
    if (
      !templateResult.error &&
      typeof templateResult.data?.messageTemplate === "string"
    ) {
      savedTemplate = templateResult.data.messageTemplate;
    }
    const message = leadDefaultReviewMessage(
      business,
      customerName,
      savedTemplate
    ).trim();
    if (!message) {
      setSendingLeadId("");
      showCustomError("Unable to build the default review message.");
      return;
    }

    const { data, error: apiError } = await sendReviewRequest(business.id, {
      customerName,
      customerEmail,
      message,
      websiteLeadId: confirmLead.id,
    });
    setSendingLeadId("");
    if (apiError || !data?.request) {
      showCustomError(errorText(apiError, "Unable to send this review email."));
      return;
    }
    const sentAt = data.request.createdAt || new Date().toISOString();
    const sentLeadId = confirmLead.id;
    setLeads((current) => {
      if (status === "new") {
        return current.filter((lead) => lead.id !== sentLeadId);
      }
      return current.map((lead) =>
        lead.id === sentLeadId
          ? { ...lead, status: "review_sent", reviewSentAt: sentAt }
          : lead
      );
    });
    setConfirmLead(null);
    showCustomSuccess("Review email sent.");
    onReviewSent?.();
  };

  if (!business.is_partner) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-5 py-6">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Lead follow-up
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Website lead follow-up comes with a Partner listing.
          </p>
        </div>
      </div>
    );
  }

  const infoClassNames = "flex w-full items-center gap-1.5 rounded-md bg-primary/20 px-2 py-1 font-medium text-primary sm:w-auto";
  const serviceClassNames = "flex w-full items-center gap-1.5 rounded-md bg-violet-100 px-2 py-1 font-medium text-violet-800 sm:w-auto dark:bg-violet-500/20 dark:text-violet-300";
  const vehicleClassNames = "flex w-full items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-800 sm:w-auto dark:bg-amber-500/20 dark:text-amber-300";
  const confirmOpen = Boolean(confirmLead);
  const confirmSending = Boolean(confirmLead && sendingLeadId === confirmLead.id);
  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3 bg-muted-foreground/5">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Website Leads
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads submitted from your website. After the job, send a review email with your default message.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative block w-full max-w-md">
              <span className="sr-only">Search leads</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, or vehicle..."
                maxLength={100}
                className={`bg-card pl-9 text-sm ${search ? "pr-9" : ""}`}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground duration-200 hover:text-destructive"
                  aria-label="Clear lead search"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </label>
            <SelectMenu
              id="lead-sort"
              aria-label="Sort leads"
              value={sort}
              onValueChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              options={LEAD_SORT_OPTIONS}
              className="w-full sm:w-36"
              triggerClassName="bg-card capitalize"
            />
            <SelectMenu
              id="lead-status"
              aria-label="Filter by status"
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={LEAD_STATUS_OPTIONS}
              className="w-full sm:w-40"
              triggerClassName="bg-card capitalize"
            />
            <SelectMenu
              id="lead-service"
              aria-label="Filter by service"
              value={services.includes(service) ? service : "all"}
              onValueChange={(value) => {
                setService(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All services" },
                ...services.map((name) => ({ value: name, label: name })),
              ]}
              className="w-full sm:w-48"
              triggerClassName="bg-card capitalize"
            />
          </div>
        </div>
        <div>
          {loading && leads.length === 0 ? (
            <div role="status" aria-live="polite">
              <p className="sr-only">Loading website leads.</p>
              <div className="space-y-3 px-5 py-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-destructive">{error}</p>
          ) : leads.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              {query || status !== "all" || service !== "all"
                ? "No leads match."
                : "No website leads yet."}
            </p>
          ) : (
            <ul className={`divide-y divide-border ${loading ? "opacity-60" : ""}`}>
              {leads.map((lead) => (
                <li key={lead.id} className="px-5 py-4 text-sm">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <p className="flex w-full items-center gap-1.5 rounded-md bg-foreground/10 px-2 py-1 font-medium text-foreground sm:w-auto">
                          <User className="size-3.5 shrink-0" aria-hidden="true" />
                          {lead.customerName}
                        </p>
                        {lead.customerEmail ? (
                          <a
                            href={`mailto:${lead.customerEmail}`}
                            className={`${infoClassNames} cursor-pointer no-underline hover:bg-primary/30 transition-all duration-200`}
                          >
                            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-medium">{lead.customerEmail}</span>
                          </a>
                        ) : null}
                        {leadTelHref(lead.customerPhone) ? (
                          <a
                            href={leadTelHref(lead.customerPhone)}
                            className={`${infoClassNames} cursor-pointer no-underline hover:bg-primary/30 transition-all duration-200`}
                          >
                            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-medium">{lead.customerPhone}</span>
                          </a>
                        ) : (
                          <p className={infoClassNames}>
                            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-medium">{lead.customerPhone}</span>
                          </p>
                        )}
                        <p className={serviceClassNames}>
                          <Wrench className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="font-medium capitalize">{lead.service}</span>
                        </p>
                        <p className={vehicleClassNames}>
                          <Car className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="font-medium">{lead.vehicle}</span>
                        </p>
                      </div>
                      <div className="mt-2 w-xl max-w-full">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md bg-muted-foreground/5 px-2 py-1.5 text-left hover:bg-muted-foreground/15 transition-all duration-200"
                          aria-expanded={openLeadIds.has(lead.id)}
                          onClick={() => {
                            setOpenLeadIds((current) => {
                              const next = new Set(current);
                              if (next.has(lead.id)) next.delete(lead.id);
                              else next.add(lead.id);
                              return next;
                            });
                          }}
                        >
                          <ChevronRight
                            className={`size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${openLeadIds.has(lead.id) ? "rotate-90" : ""}`}
                            aria-hidden="true"
                          />
                          <span className="shrink-0 font-medium text-foreground">
                            Customer&apos;s Message
                          </span>
                          {openLeadIds.has(lead.id) ? null : (
                            <span className="min-w-0 truncate text-muted-foreground">
                              {leadIssuePreview(lead.issue)}
                            </span>
                          )}
                        </button>
                        {openLeadIds.has(lead.id) ? (
                          <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted-foreground/5 p-3 leading-relaxed text-foreground">
                            {lead.issue}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-row items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className={leadStatusClass(lead.status)}>
                          {lead.status === "review_sent" ? (
                            <Check className="size-3 shrink-0" aria-hidden="true" />
                          ) : (
                            <span
                              className="relative flex size-1.5 shrink-0"
                              aria-hidden="true"
                            >
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-500/60 motion-reduce:animate-none" />
                              <span className="relative inline-flex size-1.5 rounded-full bg-sky-500" />
                            </span>
                          )}
                          {leadStatusLabel(lead.status)}
                        </span>
                        {lead.createdAt ? (
                          <span className="text-muted-foreground text-xs">
                            {formatSentAt(lead.createdAt)}
                          </span>
                        ) : null}
                      </div>
                      {lead.customerEmail && lead.status !== "review_sent" ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={Boolean(sendingLeadId)}
                          onClick={() => setConfirmLead(lead)}
                        >
                          Request Review
                          <Send aria-hidden="true" />
                        </Button>
                      ) : lead.reviewSentAt ? (
                        <span className="rounded-sm bg-muted-foreground/10 text-foreground px-2 py-1 text-xs font-medium">
                          Review sent on {formatSentAt(lead.reviewSentAt)}
                        </span>
                      ) : !lead.customerEmail ? (
                        <span className="text-xs text-muted-foreground">
                          No email on this lead
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
          <p className="text-xs text-muted-foreground">
            {page} of {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (confirmSending) return;
          if (!open) closeConfirm();
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!confirmSending}>
          <DialogHeader>
            <DialogTitle>Send Review Email?</DialogTitle>
            <DialogDescription>
              {!business.is_featured ? (
                <>
                  Review emails are included with a Featured listing. Upgrade to
                  email a Google review link from website leads.
                </>
              ) : !reviewUrl ? (
                <>
                  This listing does not have a Google place ID yet, so a review
                  link cannot be sent.
                </>
              ) : (
                <>
                  Send your default review message to{" "}
                  <strong className="font-medium text-foreground">
                    {confirmLead?.customerName}
                  </strong>{" "}
                  at{" "}
                  <strong className="font-medium text-foreground">
                    {confirmLead?.customerEmail}
                  </strong>
                  .
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {!business.is_featured ? (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeConfirm}>
                Cancel
              </Button>
              <Link
                href={`/pricing?business=${encodeURIComponent(business.id)}`}
                className={buttonVariants({ className: "justify-center" })}
                prefetch={false}
              >
                View Featured pricing
              </Link>
            </DialogFooter>
          ) : !reviewUrl ? (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeConfirm}>
                Close
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={confirmSending}
                onClick={closeConfirm}
              >
                Cancel
              </Button>
              {typeof onCustomizeReview === "function" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={confirmSending}
                  onClick={() => {
                    const lead = confirmLead;
                    setConfirmLead(null);
                    onCustomizeReview(lead);
                  }}
                >
                  Customize
                </Button>
              ) : null}
              <Button
                type="button"
                disabled={confirmSending}
                onClick={sendDefaultReview}
              >
                {confirmSending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewEmailForm({
  business,
  reviewUrl,
  usage,
  messageTemplate = null,
  onTemplateChange,
  onSent,
  prefill = null,
  onLeadReviewed,
}) {
  const { showCustomSuccess, showCustomError } = useToast();
  const builtinTemplate = defaultReviewMessageTemplate(business.title);
  const [step, setStep] = useState("edit");
  const [name, setName] = useState(() => prefill?.name ?? "");
  const [email, setEmail] = useState(() => prefill?.email ?? "");
  const [savedTemplate, setSavedTemplate] = useState(messageTemplate);
  const [draftTemplate, setDraftTemplate] = useState(null);
  const [override, setOverride] = useState(null);
  const [sending, setSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setStep("edit");
    setName(prefill?.name ?? "");
    setEmail(prefill?.email ?? "");
    setDraftTemplate(null);
    setOverride(null);
    setErrors({});
  }, [business.id, business.title, prefill?.id, prefill?.name, prefill?.email]);

  useEffect(() => {
    setSavedTemplate(messageTemplate);
    setDraftTemplate(null);
    setOverride(null);
  }, [business.id, messageTemplate]);

  const persistedTemplate = savedTemplate || builtinTemplate;
  const activeTemplate = draftTemplate ?? persistedTemplate;
  const message =
    override === null
      ? applyReviewMessageTemplate(activeTemplate, name)
      : override;
  const currentTemplate =
    override === null
      ? activeTemplate
      : reviewMessageToTemplate(override, name);
  const templateDirty = currentTemplate !== persistedTemplate;
  const showingStandard = currentTemplate === builtinTemplate;
  const hasCustomDefault = Boolean(savedTemplate) && savedTemplate !== builtinTemplate;
  const offerSavedDefault = showingStandard && hasCustomDefault;

  const blocked = Boolean(usage && !usage.unlimited && usage.sentThisMonth >= usage.limit);
  const subject = reviewEmailSubject(business.title);

  const clearError = (field) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const continueToPreview = (event) => {
    event.preventDefault();
    const nextErrors = reviewFormErrors({ name, email, message });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStep("preview");
  };

  const send = async () => {
    if (sending || blocked) return;
    setSending(true);
    const payload = {
      customerName: name.trim(),
      customerEmail: email.trim(),
      message: message.trim(),
    };
    if (prefill?.id) payload.websiteLeadId = prefill.id;
    const { data, error } = await sendReviewRequest(business.id, payload);
    setSending(false);
    if (error || !data?.request) {
      const message = errorText(error, "Unable to send this review email.");
      if (
        (error?.code === "too-many-requests" &&
          /this customer already received/i.test(message)) ||
        /unsubscribed from emails/i.test(message)
      ) {
        setStep("edit");
        setErrors((current) => ({ ...current, email: message }));
        return;
      }
      showCustomError(message);
      onSent();
      return;
    }
    showCustomSuccess("Review email sent.");
    setStep("edit");
    setName("");
    setEmail("");
    setDraftTemplate(null);
    setOverride(null);
    onLeadReviewed?.();
    onSent(data.usage);
  };

  const saveTemplate = async () => {
    if (savingTemplate || !templateDirty) return;
    setSavingTemplate(true);
    const { data, error } = await saveReviewMessageTemplate(
      business.id,
      currentTemplate
    );
    setSavingTemplate(false);
    if (error || !data?.messageTemplate) {
      showCustomError(errorText(error, "Unable to save this review message."));
      return;
    }
    setSavedTemplate(data.messageTemplate);
    setDraftTemplate(null);
    setOverride(null);
    onTemplateChange?.(data.messageTemplate);
    showCustomSuccess("Default review message saved.");
  };

  const useStandardMessage = () => {
    if (savingTemplate) return;
    clearError("message");
    if (offerSavedDefault) {
      setDraftTemplate(null);
      setOverride(null);
      return;
    }
    if (showingStandard) return;
    setDraftTemplate(builtinTemplate);
    setOverride(null);
  };

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-5">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        Email a Review Link
      </h3>
      {blocked ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Featured listings can send {usage.limit} review emails a month. Send
          again next month.
        </p>
      ) : null}

      {step === "edit" ? (
        <form className="mt-4 space-y-3" noValidate onSubmit={continueToPreview}>
          <label className="block text-sm font-medium text-foreground">
            Customer Name
            <Input
              className="mt-1.5"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              placeholder="John Doe"
              autoComplete="name"
              maxLength={120}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>
            ) : null}
          </label>
          <label className="block text-sm font-medium text-foreground">
            Email
            <Input
              className="mt-1.5"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              placeholder="customer@email.com"
              autoComplete="email"
              maxLength={320}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
            ) : null}
          </label>
          <label className="block text-sm font-medium text-foreground">
            Message
            <Textarea
              className="mt-1.5 min-h-28"
              value={message}
              onChange={(event) => {
                setOverride(event.target.value);
                clearError("message");
              }}
              placeholder="Thanks for visiting. A Google review helps other drivers find the shop."
              maxLength={2000}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>
            ) : null}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={saveTemplate}
              disabled={!templateDirty || savingTemplate}
              className="w-full sm:w-auto px-4"
            >
              <Save aria-hidden="true" />
              {savingTemplate ? "Saving…" : "Save as Default"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={useStandardMessage}
              disabled={(showingStandard && !hasCustomDefault) || savingTemplate}
              className="w-full sm:w-auto px-4"
            >
              <ArrowLeftRight aria-hidden="true" />
              {offerSavedDefault ? "Use Default" : "Use Standard Message"}
            </Button>
          </div>
          <p className="rounded-md bg-primary/10 p-2 text-center text-xs text-muted-foreground">
            The email includes a Google review link, says it was sent by
            RadiatorRepairHub on behalf of {business.title}, and lets the
            customer unsubscribe from review emails for this shop.
            {typeof business.email === "string" && business.email.includes("@")
              ? ` Replies go to ${business.email.trim()}.`
              : ""}
          </p>
          <Button type="submit" disabled={blocked || !reviewUrl || savingTemplate} className="w-full sm:w-auto px-4">
            Next
            <ArrowRight aria-hidden="true" />
          </Button>
        </form>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-background px-4 py-4 text-sm">
            <p className="text-muted-foreground">
              From <span className="text-foreground">{business.title}</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              To <span className="text-foreground">{email.trim()}</span>
            </p>
            <p className="mt-2 font-medium text-foreground">{subject}</p>
            <p className="mt-3 whitespace-pre-wrap text-foreground">{message.trim()}</p>
            <p className="mt-3">
              <a href={reviewUrl} className="text-interactive underline" target="_blank" rel="noreferrer">
                Leave a Google review
              </a>
            </p>
            <p className="mt-3 text-muted-foreground">
              {reviewSentByLine(business.title)} {reviewUnsubscribeLine(business.title)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep("edit")} disabled={sending}>
              Edit
            </Button>
            <Button type="button" onClick={send} disabled={sending || blocked}>
              <Send aria-hidden="true" />
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function monthlySendBarClass(sent, limit) {
  const count = Math.max(0, Number(sent) || 0);
  if (count >= 16) return "bg-red-600";
  if (count >= Number(limit) / 2) return "bg-amber-500";
  return "bg-green-600";
}

function MonthlySendProgress({ usage }) {
  const sent = Math.max(0, Number(usage.sentThisMonth) || 0);
  const limit = Math.max(1, Number(usage.limit) || 1);
  const percent = Math.min(100, (sent / limit) * 100);

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
        <span>Monthly Limit</span>
        <span className="tabular-nums text-primary font-semibold">
          {sent} of {usage.limit}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={sent}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${sent} of ${usage.limit} review emails sent this month`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none ${monthlySendBarClass(sent, limit)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SentEmailsSkeleton() {
  const rows = [
    ["w-32", "w-44", "w-24"],
    ["w-24", "w-36", "w-20"],
    ["w-40", "w-48", "w-28"],
    ["w-28", "w-40", "w-24"],
    ["w-36", "w-32", "w-20"],
  ];

  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {rows.map(([nameWidth, emailWidth, statusWidth], index) => (
        <li
          key={index}
          className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-2">
            <Skeleton className={`h-4 rounded-md ${nameWidth}`} />
            <Skeleton className={`h-3 rounded-md ${emailWidth}`} />
          </div>
          <Skeleton className={`h-3 rounded-md ${statusWidth}`} />
        </li>
      ))}
    </ul>
  );
}

function ReviewFollowUp({
  business,
  prefill = null,
  onLeadReviewed,
  reloadKey: parentReloadKey = 0,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usage, setUsage] = useState(null);
  const [messageTemplate, setMessageTemplate] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const reviewUrl = googleReviewUrl(business.place_id);

  useEffect(() => {
    setPage(1);
    setSelectedRequest(null);
  }, [business.id]);

  useEffect(() => {
    if (!business?.is_featured) return undefined;
    let mounted = true;
    setLoading(true);
    setError("");
    fetchReviewRequests(business.id, page).then(({ data, error: apiError }) => {
      if (!mounted) return;
      if (apiError) {
        setError(errorText(apiError, "Unable to load review emails."));
        setRequests([]);
        setTotalPages(1);
        setUsage(null);
      } else {
        const nextTotalPages = Math.max(1, Number(data?.pagination?.totalPages) || 1);
        if (page > nextTotalPages) {
          setPage(nextTotalPages);
        } else {
          setRequests(Array.isArray(data?.requests) ? data.requests : []);
          setTotalPages(nextTotalPages);
          setUsage(data?.usage ?? null);
          setMessageTemplate(
            typeof data?.messageTemplate === "string" ? data.messageTemplate : null
          );
          setError("");
        }
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [business.id, business.is_featured, page, reloadKey, parentReloadKey]);

  if (!business.is_featured) {
    return <FeaturedReviewLock business={business} />;
  }

  return (
    <>
      <div
        className={
          reviewUrl
            ? "grid items-start gap-4 lg:grid-cols-[26rem_minmax(0,1fr)_18rem]"
            : "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]"
        }
      >
        {reviewUrl ? (
          <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
            <ReviewEmailForm
              business={business}
              reviewUrl={reviewUrl}
              usage={usage}
              messageTemplate={messageTemplate}
              onTemplateChange={setMessageTemplate}
              prefill={prefill}
              onLeadReviewed={onLeadReviewed}
              onSent={(nextUsage) => {
                if (nextUsage) setUsage(nextUsage);
                setPage(1);
                setReloadKey((value) => value + 1);
              }}
            />
          </div>
        ) : null}

        <div
          className={
            reviewUrl
              ? "order-3 flex min-w-0 flex-col self-start rounded-lg border border-border bg-card lg:col-start-2 lg:row-start-1 lg:h-full lg:self-stretch"
              : "order-3 flex min-w-0 flex-col rounded-lg border border-border bg-card lg:col-start-1 lg:row-start-1"
          }
        >
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Sent Emails
            </h3>
            {usage && !usage.unlimited ? (
              <MonthlySendProgress usage={usage} />
            ) : null}
          </div>
          <div className="flex-1">
            {loading && requests.length === 0 ? (
              <div role="status" aria-live="polite">
                <p className="sr-only">Loading sent emails.</p>
                <SentEmailsSkeleton />
              </div>
            ) : error ? (
              <p className="px-5 py-4 text-sm text-destructive">{error}</p>
            ) : requests.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">
                No review emails yet.
              </p>
            ) : (
              <ul className={`divide-y divide-border ${loading ? "opacity-60" : ""}`}>
                {requests.map((request) => (
                  <li key={request.id}>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer flex-col gap-1 px-5 py-3 text-left text-sm hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {request.customerName}
                        </p>
                        <p className="truncate text-muted-foreground">
                          {request.customerEmail}
                        </p>
                      </div>
                      <p className="shrink-0 text-muted-foreground">
                        {request.status === "sent" ? "Sent" : "Failed"}
                        {request.createdAt ? ` · ${formatSentAt(request.createdAt)}` : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border px-3 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <p className="text-xs text-muted-foreground">
              {page} of {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          className={
            reviewUrl
              ? "order-2 rounded-lg border border-border bg-card px-5 py-5 lg:col-start-3 lg:row-start-1 lg:h-full lg:self-stretch"
              : "order-2 rounded-lg border border-border bg-card px-5 py-5 lg:col-start-2 lg:row-start-1 lg:h-full lg:self-stretch"
          }
        >
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Review QR Code
          </h3>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Print this and keep it by the register. A scan opens the Google
            review page for <strong className="font-semibold text-primary">{business.title}</strong>.
          </p>
          <ReviewQrCode reviewUrl={reviewUrl} shopTitle={business.title} />
        </div>
      </div>

      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.customerName}</DialogTitle>
            <DialogDescription>
              {selectedRequest?.customerEmail}
              {selectedRequest?.createdAt
                ? ` · ${formatSentAt(selectedRequest.createdAt)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="whitespace-pre-wrap text-foreground">
              {selectedRequest?.message}
            </p>
            {selectedRequest?.reviewUrl ? (
              <p>
                <a
                  href={selectedRequest.reviewUrl}
                  className="text-interactive underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Leave a Google review
                </a>
              </p>
            ) : null}
            <p className="text-muted-foreground">
              {reviewSentByLine(business.title)} {reviewUnsubscribeLine(business.title)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AutomationPanel({
  businesses = [],
  initialBusinessId = "",
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState("");
  const [reviewPrefill, setReviewPrefill] = useState(null);
  const [leadReloadKey, setLeadReloadKey] = useState(0);
  const [reviewReloadKey, setReviewReloadKey] = useState(0);
  const requestedSection = searchParams.get("section");
  const [section, setSection] = useState(
    requestedSection === "lead" || requestedSection === "review"
      ? requestedSection
      : ""
  );
  const defaultedRef = useRef(Boolean(section));
  const lastInitialIdRef = useRef("");

  useEffect(() => {
    if (!businesses.length) {
      setSelectedId("");
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

  const selected = businesses.find((business) => business.id === selectedId);

  useEffect(() => {
    if (!selected || defaultedRef.current) return;
    const next = selected.is_partner ? "lead" : "review";
    defaultedRef.current = true;
    setSection(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "automation");
    params.set("section", next);
    params.set("business", selected.id);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }, [selected, pathname, searchParams]);

  const onSectionChange = (value) => {
    setSection(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "automation");
    params.set("section", value);
    if (selectedId) params.set("business", selectedId);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  const onBusinessChange = (value) => {
    setSelectedId(value);
    setReviewPrefill(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "automation");
    params.set("business", value);
    if (section) params.set("section", section);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  if (!businesses.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-medium text-foreground">No businesses yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claim a listing to request reviews from customers.
        </p>
      </div>
    );
  }

  const activeSection = section || (selected?.is_partner ? "lead" : "review");

  return (
    <Tabs
      value={activeSection}
      onValueChange={onSectionChange}
      className="min-w-0 gap-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <SelectMenu
          id="automation-business"
          label="Business"
          value={selectedId}
          onValueChange={onBusinessChange}
          options={businesses.map((business) => ({
            value: business.id,
            label: business.title,
          }))}
          className="w-fit"
          triggerClassName="w-fit"
        />
        <TabsList>
          <TabsTrigger value="lead" className={tabsTriggerClassNames}>
            Lead Follow-up
          </TabsTrigger>
          <TabsTrigger value="review" className={tabsTriggerClassNames}>
            Review Follow-up
          </TabsTrigger>
        </TabsList>
      </div>

      {selected ? (
        <>
          <TabsContent value="lead">
            <LeadFollowUp
              business={selected}
              reloadKey={leadReloadKey}
              onReviewSent={() => {
                setReviewReloadKey((value) => value + 1);
              }}
              onCustomizeReview={(lead) => {
                setReviewPrefill({
                  id: lead.id,
                  name: lead.customerName,
                  email: lead.customerEmail,
                });
                onSectionChange("review");
              }}
            />
          </TabsContent>
          <TabsContent value="review">
            <ReviewFollowUp
              business={selected}
              prefill={reviewPrefill}
              reloadKey={reviewReloadKey}
              onLeadReviewed={() => {
                setReviewPrefill(null);
                setLeadReloadKey((value) => value + 1);
              }}
            />
          </TabsContent>
        </>
      ) : null}
    </Tabs>
  );
}
