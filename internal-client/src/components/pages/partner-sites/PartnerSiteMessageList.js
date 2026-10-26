"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CheckIcon, SearchIcon, SparklesIcon, XIcon } from "lucide-react";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/pages/dashboard/Pagination";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

const LEAD_STATUS = {
  new: {
    label: "New",
    variant: "outline",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
    Icon: SparklesIcon,
  },
  review_sent: { label: "Review sent", variant: "default" },
};

const REVIEW_STATUS = {
  sent: {
    label: "Sent",
    variant: "outline",
    className:
      "border-transparent bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
    Icon: CheckIcon,
  },
  failed: { label: "Failed", variant: "destructive" },
};

function errorText(error, fallback) {
  const message = error?.message;
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
}

function MessageSearch({ value, onChange }) {
  const [text, setText] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setText(value);
  }, [value]);

  const emit = useMemo(
    () => debounce((next) => onChangeRef.current(next), 300),
    []
  );

  useEffect(() => () => emit.cancel(), [emit]);

  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          emit(next);
        }}
        placeholder="Search business or customer"
        aria-label="Search by business or customer"
        name="rrh-partner-message-search"
        autoComplete="off"
        className="rounded-full pr-9 pl-9"
      />
      {text ? (
        <button
          type="button"
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
          onClick={() => {
            emit.cancel();
            setText("");
            onChange("");
          }}
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function statusBadge(kind, status) {
  const known = (kind === "leads" ? LEAD_STATUS : REVIEW_STATUS)[status];
  return known ?? { label: status || "Unknown", variant: "outline" };
}

function StatusBadge({ status }) {
  const Icon = status.Icon;
  return (
    <Badge variant={status.variant} className={status.className}>
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {status.label}
    </Badge>
  );
}

function MessageDialog({ kind, message, onClose }) {
  if (!message) return null;
  const status = statusBadge(kind, message.status);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{message.customerName || "Message"}</DialogTitle>
          <DialogDescription>
            {message.businessTitle}
            {message.createdAt ? ` · ${formatFullDate(message.createdAt)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {message.customerEmail ? (
              <span className="break-all text-muted-foreground">{message.customerEmail}</span>
            ) : null}
            {message.customerPhone ? (
              <span className="text-muted-foreground">{message.customerPhone}</span>
            ) : null}
          </div>
          {kind === "leads" ? (
            <p className="text-muted-foreground">
              {[message.service, message.vehicle].filter(Boolean).join(" · ") || "No request details"}
            </p>
          ) : null}
          <p className="whitespace-pre-wrap">{message.message || "No message"}</p>
          {message.reviewUrl ? (
            <a
              href={message.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-primary underline-offset-4 hover:underline"
            >
              {message.reviewUrl}
            </a>
          ) : null}
          {message.error ? (
            <p className="text-destructive">{message.error}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PartnerSiteMessageList({
  kind,
  page,
  search = "",
  accessToken,
  onPageChange,
  onSearchChange,
}) {
  const [selected, setSelected] = useState(null);
  const endpoint =
    kind === "leads"
      ? "/admin/partner-sites/lead-follow-ups"
      : "/admin/partner-sites/review-requests";
  const query = search.trim();
  const emptyLabel = query
    ? "No messages match that search."
    : kind === "leads"
      ? "No lead follow-ups yet."
      : "No review requests yet.";
  const errorLabel =
    kind === "leads"
      ? "Unable to load lead follow-ups."
      : "Unable to load review requests.";

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["partner-site-messages", kind, page, query],
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set("q", query);
      const result = await fetchApi(`${endpoint}?${params}`, { accessToken });
      if (result.error) throw new Error(errorText(result.error, errorLabel));
      return result.data;
    },
  });

  const messages = data?.messages ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <MessageSearch value={search} onChange={onSearchChange} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading messages.</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <>
      <div className={`rounded-lg border border-border ${isFetching ? "opacity-70" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Sent</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => {
                const status = statusBadge(kind, message.status);
                return (
                  <TableRow
                    key={message.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(message)}
                  >
                    <TableCell className="text-muted-foreground">
                      {formatFullDate(message.createdAt)}
                    </TableCell>
                    <TableCell>
                      {message.businessId ? (
                        <Link
                          href={`/businesses/${message.businessId}`}
                          className="font-medium hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {message.businessTitle}
                        </Link>
                      ) : (
                        message.businessTitle
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="block truncate font-medium">{message.customerName}</span>
                      <span className="block truncate text-muted-foreground">
                        {message.customerEmail || message.customerPhone || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        page={page}
        displayPage={page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPrevious={() => onPageChange(Math.max(1, page - 1))}
        onNext={() => onPageChange(page + 1)}
      />
      <MessageDialog
        kind={kind}
        message={selected}
        onClose={() => setSelected(null)}
      />
        </>
      )}
    </div>
  );
}
