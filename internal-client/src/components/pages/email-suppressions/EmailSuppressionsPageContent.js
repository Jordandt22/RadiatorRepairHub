"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ListIcon,
  MailIcon,
  MegaphoneIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const TYPE_TABS = [
  { id: "all", label: "All", Icon: ListIcon },
  { id: "weekly_digest", label: "Weekly digest", Icon: MailIcon },
  { id: "business_email", label: "Outreach", Icon: MegaphoneIcon },
  { id: "review_request", label: "Review request", Icon: StarIcon },
];

const QUERY_SCHEMA = {
  type: {
    type: "option",
    options: TYPE_TABS,
    resetPageOnChange: true,
  },
  page: { type: "page", defaultValue: 1 },
  q: { type: "string", defaultValue: "", resetPageOnChange: true },
};

const TYPE_BADGE = {
  weekly_digest: {
    label: "Weekly digest",
    className:
      "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  },
  business_email: {
    label: "Outreach",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  review_request: {
    label: "Review request",
    className:
      "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
  },
};

const SOURCE_LABELS = {
  unsubscribe_link: "Unsubscribe link",
  settings: "Settings",
  admin: "Admin",
};

function errorText(error, fallback) {
  const message = error?.message;
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
}

function SuppressionSearch({ value, onChange }) {
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
        placeholder="Search business or email"
        aria-label="Search by business or email"
        name="rrh-email-suppression-search"
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

function TypeTabs({ value, onValueChange }) {
  const activeTab = TYPE_TABS.find((tab) => tab.id === value) ?? TYPE_TABS[0];
  const ActiveIcon = activeTab.Icon;

  return (
    <>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-11 w-full justify-between rounded-full px-3 text-base font-medium"
              />
            }
          >
            <span className="ml-2 flex items-center gap-2.5">
              <ActiveIcon className="size-4" />
              {activeTab.label}
            </span>
            <ChevronDownIcon className="size-5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-(--anchor-width) text-sm">
            <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
              {TYPE_TABS.map(({ id, label, Icon }) => (
                <DropdownMenuRadioItem
                  key={id}
                  value={id}
                  className="min-h-9 py-2 text-sm [&_svg]:size-4"
                >
                  <Icon />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Tabs value={value} onValueChange={onValueChange} className="hidden md:block">
        <TabsList className="rounded-full">
          {TYPE_TABS.map(({ id, label, Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="cursor-pointer px-6 transition-all duration-200 hover:translate-y-[-2px] md:px-8"
            >
              <Icon data-icon="inline-center" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}

function TypeBadge({ type }) {
  const known = TYPE_BADGE[type] ?? {
    label: type || "Unknown",
    className: "border-transparent bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={known.className}>
      {known.label}
    </Badge>
  );
}

export default function EmailSuppressionsPageContent() {
  const router = useRouter();
  const { accessToken, isReady } = useAuth();
  const query = useUrlQueryState(QUERY_SCHEMA);
  const activeType = query.type?.id && query.type.id !== "all" ? query.type.id : "all";
  const search = query.q ?? "";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["email-suppressions", query.page, search.trim(), activeType],
    enabled: Boolean(isReady && accessToken),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(query.page) });
      const trimmed = search.trim();
      if (trimmed) params.set("q", trimmed);
      if (activeType !== "all") params.set("type", activeType);
      const result = await fetchApi(`/admin/email-suppressions?${params}`, {
        accessToken,
      });
      if (result.error) {
        throw new Error(errorText(result.error, "Unable to load email suppressions."));
      }
      return result.data;
    },
  });

  if (!isReady || !accessToken) return null;

  const rows = data?.suppressions ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;
  const emptyLabel = search.trim()
    ? "No suppressions match that search."
    : "No email suppressions yet.";

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Email Suppressions</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Addresses that opted out of weekly digests, outreach, or review requests for a shop.
        </p>
      </div>
      <TypeTabs
        value={activeType}
        onValueChange={(tabId) => {
          if (tabId === "all") {
            query.setField("type", null);
            return;
          }
          const option = TYPE_TABS.find((tab) => tab.id === tabId);
          if (option) query.setField("type", option);
        }}
      />
      <SuppressionSearch
        value={search}
        onChange={(value) => query.setField("q", value)}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading email suppressions.</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <>
          <div className={`rounded-lg border border-border ${isFetching ? "opacity-70" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Added</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead className="w-36">Type</TableHead>
                  <TableHead className="w-36">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-muted-foreground">
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground">
                        {formatFullDate(row.createdAt)}
                      </TableCell>
                      <TableCell className="truncate font-medium">{row.email}</TableCell>
                      <TableCell>
                        {row.businessId ? (
                          <Link
                            href={`/businesses/${row.businessId}`}
                            className="font-medium hover:underline"
                          >
                            {row.businessTitle}
                          </Link>
                        ) : (
                          row.businessTitle
                        )}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={row.type} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {SOURCE_LABELS[row.source] || row.source || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={query.page}
            displayPage={query.page}
            totalPages={totalPages}
            total={total}
            isFetching={isFetching}
            onPrevious={() => query.setField("page", Math.max(1, query.page - 1))}
            onNext={() => query.setField("page", query.page + 1)}
          />
        </>
      )}
    </div>
  );
}
