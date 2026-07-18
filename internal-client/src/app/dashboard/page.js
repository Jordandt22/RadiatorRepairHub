"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  FlagIcon,
  MessageCircleOffIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { useLoading } from "@/contexts/Loading.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import {
  formatIssueLabel,
  formatStatusLabel,
  formatUrgencyLabel,
  ISSUE_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  URGENCY_BADGE_CLASSES,
} from "@/lib/contact-messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_LIMIT = 30;

const TAB_STATUS = {
  all: null,
  approved: "approved",
  sent: "sent",
  flagged: "flagged",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "numeric",
    day: "numeric",
  });
}

function formatFullDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function IssueBadge({ issue }) {
  return (
    <Badge
      variant="outline"
      className={ISSUE_BADGE_CLASSES[issue] || ISSUE_BADGE_CLASSES.other}
    >
      {formatIssueLabel(issue)}
    </Badge>
  );
}

const STATUS_ICONS = {
  pending: ClockIcon,
  approved: CheckIcon,
  sent: SendIcon,
  declined: XIcon,
  no_response: MessageCircleOffIcon,
  flagged: FlagIcon,
};

function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status];

  return (
    <Badge
      variant="outline"
      className={
        STATUS_BADGE_CLASSES[status] ||
        "border-transparent bg-zinc-100 text-zinc-700"
      }
    >
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {formatStatusLabel(status)}
    </Badge>
  );
}

function UrgencyBadge({ urgency }) {
  return (
    <Badge
      variant="outline"
      className={
        URGENCY_BADGE_CLASSES[urgency] ||
        "border-transparent bg-zinc-100 text-zinc-700"
      }
    >
      {formatUrgencyLabel(urgency)}
    </Badge>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

function ContactMessageDrawer({ message, open, onOpenChange }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{message?.name || "Contact message"}</DrawerTitle>
          <DrawerDescription>Contact message details</DrawerDescription>
        </DrawerHeader>

        {message ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Name">{message.name}</DetailRow>
              <DetailRow label="Email">
                <a
                  href={`mailto:${message.email}`}
                  className="underline underline-offset-2"
                >
                  {message.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">{message.phone || "—"}</DetailRow>
              <DetailRow label="Vehicle">{message.vehicle || "—"}</DetailRow>
              <DetailRow label="Business">
                {message.business?.title ? (
                  message.business.slug ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_WEB_URL}/business/${message.business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {message.business.title}
                    </a>
                  ) : (
                    message.business.title
                  )
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Issue">
                <IssueBadge issue={message.issue} />
              </DetailRow>
              <DetailRow label="Urgency">
                <UrgencyBadge urgency={message.urgency} />
              </DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={message.status} />
              </DetailRow>
              <DetailRow label="Additional details">
                <p className="whitespace-pre-wrap">
                  {message.additional_details || "—"}
                </p>
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(message.created_at)}
              </DetailRow>
              <DetailRow label="Sent at">
                {formatFullDate(message.sent_at)}
              </DetailRow>
              <DetailRow label="Message ID">
                <span className="break-all font-mono text-xs">
                  {message.contact_message_id}
                </span>
              </DetailRow>
              {message.business_id ? (
                <DetailRow label="Business ID">
                  <span className="break-all font-mono text-xs">
                    {message.business_id}
                  </span>
                </DetailRow>
              ) : null}
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

function ContactMessagesTable({
  messages,
  selectedIds,
  onToggleId,
  onToggleAll,
  onViewClick,
}) {
  if (!messages?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No contact messages found.
      </p>
    );
  }

  const pageIds = messages.map((message) => message.contact_message_id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someSelected =
    selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked) => onToggleAll(checked === true)}
              onClick={(event) => event.stopPropagation()}
              aria-label="Select all on page"
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Business</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Urgency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => {
          const id = message.contact_message_id;
          const isSelected = selectedIds.has(id);

          return (
            <TableRow
              key={id}
              className="group cursor-pointer"
              data-state={isSelected ? "selected" : undefined}
              onClick={() => onToggleId(id, !isSelected)}
            >
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onToggleId(id, checked === true)
                  }
                  aria-label={`Select ${message.name}`}
                />
              </TableCell>
              <TableCell className="font-semibold">{message.name}</TableCell>
              <TableCell>{message.business?.title || "—"}</TableCell>
              <TableCell>{message.email}</TableCell>
              <TableCell>
                <IssueBadge issue={message.issue} />
              </TableCell>
              <TableCell>
                <UrgencyBadge urgency={message.urgency} />
              </TableCell>
              <TableCell>
                <StatusBadge status={message.status} />
              </TableCell>
              <TableCell>{formatDate(message.created_at)}</TableCell>
              <TableCell
                className="text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => onViewClick(message)}
                >
                  <EyeIcon />
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function ContactMessagesTableSkeleton({ rows = 8 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Skeleton className="size-4" />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Business</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Urgency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="size-4" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-36" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="ml-auto h-6 w-14" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const { setLoading } = useLoading();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);

  const statusFilter = TAB_STATUS[activeTab] ?? null;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["contact-messages", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const result = await fetchApi(
        `/admin/contact-messages?${params.toString()}`,
        { accessToken },
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch messages");
      }
      return result.data;
    },
    enabled: isReady && !!accessToken,
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, contact_message_ids }) => {
      const result = await fetchApi("/admin/contact-messages/status", {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ status, contact_message_ids }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to update status";
        throw new Error(message);
      }

      return result.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: (err) => {
      setActionError(err.message || "Failed to update status");
    },
  });

  useEffect(() => {
    setLoading(statusMutation.isPending);
  }, [statusMutation.isPending, setLoading]);

  const selectedIdsRef = useRef(selectedIds);
  const isPendingRef = useRef(statusMutation.isPending);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    isPendingRef.current = statusMutation.isPending;
  }, [statusMutation.isPending]);

  const runStatusUpdate = useMemo(
    () =>
      debounce((status) => {
        const contact_message_ids = Array.from(selectedIdsRef.current);
        if (contact_message_ids.length === 0 || isPendingRef.current) {
          return;
        }
        setActionError(null);
        statusMutation.mutate({ status, contact_message_ids });
      }, 400),
    [statusMutation.mutate],
  );

  useEffect(() => {
    return () => runStatusUpdate.cancel();
  }, [runStatusUpdate]);

  if (!isReady || !accessToken) {
    return null;
  }

  const messages = data?.contactMessages ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasSelection = selectedIds.size > 0;
  const actionsDisabled = !hasSelection || statusMutation.isPending;

  const handleToggleId = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleAll = (checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const message of messages) {
        if (checked) next.add(message.contact_message_id);
        else next.delete(message.contact_message_id);
      }
      return next;
    });
  };

  const handleViewClick = (message) => {
    setSelectedMessage(message);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-3 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={actionsDisabled}
            onClick={() => runStatusUpdate("flagged")}
          >
            <FlagIcon />
            Flag All
          </Button>
          <Button
            size="sm"
            disabled={actionsDisabled}
            onClick={() => runStatusUpdate("approved")}
          >
            <CheckIcon />
            Approve All
          </Button>
          {hasSelection ? (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select messages to update
            </span>
          )}
        </div>

        {actionError ? (
          <p className="text-sm text-destructive">{actionError}</p>
        ) : null}

        {error && !isLoading && !isFetching ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : null}

        {isLoading ? (
          <ContactMessagesTableSkeleton />
        ) : !error ? (
          <div
            className={
              isFetching || isPlaceholderData
                ? "opacity-60 transition-opacity"
                : undefined
            }
          >
            <ContactMessagesTable
              messages={messages}
              selectedIds={selectedIds}
              onToggleId={handleToggleId}
              onToggleAll={handleToggleAll}
              onViewClick={handleViewClick}
            />
          </div>
        ) : null}

        {totalPages > 0 ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeftIcon />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data?.page ?? page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
              <ChevronRightIcon />
            </Button>
          </div>
        ) : null}
      </div>

      <ContactMessageDrawer
        message={selectedMessage}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
