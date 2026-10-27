"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  PencilIcon,
  StarIcon,
  StoreIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PartnerSiteMessageList from "@/components/pages/partner-sites/PartnerSiteMessageList";

const PARTNER_TABS = [
  { id: "businesses", label: "Businesses", Icon: StoreIcon },
  { id: "leads", label: "Lead Follow-Up", Icon: MailIcon },
  { id: "reviews", label: "Review Request", Icon: StarIcon },
];

const QUERY_SCHEMA = {
  tab: {
    type: "option",
    options: PARTNER_TABS,
    resetPageOnChange: true,
  },
  page: { type: "page", defaultValue: 1 },
  q: { type: "string", defaultValue: "", resetPageOnChange: true },
};

const TAB_COPY = {
  businesses:
    "Save the shop domain and copy the API key into that website's env file. Allowed origins are the https hosts the form may send from.",
  leads: "Lead follow-up messages sent from partner website forms, across every shop.",
  reviews: "Review request emails sent for every shop.",
};

function PartnerSiteTabs({ value, onValueChange }) {
  const activeTab = PARTNER_TABS.find((tab) => tab.id === value) ?? PARTNER_TABS[0];
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
              {PARTNER_TABS.map(({ id, label, Icon }) => (
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
          {PARTNER_TABS.map(({ id, label, Icon }) => (
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

function errorText(error, fallback) {
  const message = error?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (message && typeof message === "object") {
    const first = Object.values(message).find(
      (value) => typeof value === "string" && value.trim()
    );
    if (first) return first;
  }
  return fallback;
}

function KeyCell({ apiKey }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!apiKey) {
    return <span className="text-sm text-muted-foreground">No key yet</span>;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <code className="max-w-56 truncate text-xs">
        {shown ? apiKey : "•".repeat(12)}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={shown ? "Hide API key" : "Show API key"}
        onClick={() => setShown((current) => !current)}
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Copy API key"
        onClick={copy}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  );
}

function formatIntakeSubmittedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PartnerSiteRow({ site, onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [domain, setDomain] = useState(site.domain || "");
  const [error, setError] = useState("");
  const [keyError, setKeyError] = useState("");
  const intakeSubmitted = site.intakeStatus === "submitted";

  function startEdit() {
    setDomain(site.domain || "");
    setError("");
    setOpen(true);
  }

  async function save(generateKey) {
    setError("");
    const result = await onSave({ domain, generateKey });
    if (result?.error) {
      setError(errorText(result.error, "Unable to save this partner site."));
      return;
    }
    setOpen(false);
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{site.title}</TableCell>
      <TableCell className="max-w-56 text-sm">
        {site.notificationEmail ? (
          <span className="break-all">{site.notificationEmail}</span>
        ) : (
          <span className="text-muted-foreground">Not set</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {intakeSubmitted ? (
          <span className="inline-flex flex-col gap-0.5">
            <span className="font-medium text-foreground">Submitted</span>
            {site.intakeSubmittedAt ? (
              <span className="text-xs text-muted-foreground">
                {formatIntakeSubmittedAt(site.intakeSubmittedAt)}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground">Needs info</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {site.domain || <span className="text-muted-foreground">Not set</span>}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={startEdit}
          >
            <PencilIcon />
            Edit
          </Button>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (saving) return;
            setOpen(next);
          }}
        >
          <DialogContent className="sm:max-w-md" showCloseButton={!saving}>
            <DialogHeader>
              <DialogTitle>Edit domain</DialogTitle>
              <DialogDescription>{site.title}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`partner-domain-${site.businessId}`}>Domain</Label>
              <Input
                id={`partner-domain-${site.businessId}`}
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="ironbayradiator.com"
                autoComplete="off"
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>
            <DialogFooter className="flex-col items-stretch sm:flex-col sm:items-stretch">
              <Button
                type="button"
                className="cursor-pointer"
                disabled={saving || !domain.trim()}
                onClick={() => save(false)}
              >
                Update domain
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={saving || !domain.trim()}
                onClick={() => save(true)}
              >
                Update domain and generate key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {site.allowedOrigins?.length ? site.allowedOrigins.join(", ") : "—"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <KeyCell apiKey={site.apiKey} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setKeyError("");
              setKeyOpen(true);
            }}
          >
            New key
          </Button>
        </div>
        <Dialog
          open={keyOpen}
          onOpenChange={(next) => {
            if (saving) return;
            setKeyOpen(next);
          }}
        >
          <DialogContent className="sm:max-w-md" showCloseButton={!saving}>
            <DialogHeader>
              <DialogTitle>Generate a new API key</DialogTitle>
              <DialogDescription>
                {site.domain
                  ? `${site.title}. The current key stops working immediately. Put the new key in the website env and rebuild.`
                  : `${site.title}. Save a domain before generating a key.`}
              </DialogDescription>
            </DialogHeader>
            {keyError ? <p className="text-xs text-destructive">{keyError}</p> : null}
            <DialogFooter>
              <Button
                type="button"
                className="cursor-pointer"
                disabled={saving || !site.domain}
                onClick={async () => {
                  setKeyError("");
                  const result = await onSave({
                    domain: site.domain,
                    generateKey: true,
                  });
                  if (result?.error) {
                    setKeyError(
                      errorText(result.error, "Unable to generate a new key.")
                    );
                    return;
                  }
                  setKeyOpen(false);
                }}
              >
                Generate new key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          nativeButton={false}
          render={
            <Link
              href={`/businesses/${site.businessId}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <EyeIcon />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function PartnerSitesPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady } = useAuth();
  const [savingId, setSavingId] = useState("");
  const query = useUrlQueryState(QUERY_SCHEMA);
  const activeTab = query.tab?.id ?? "businesses";

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["partner-sites"],
    enabled: Boolean(isReady && accessToken && activeTab === "businesses"),
    queryFn: async () => {
      const result = await fetchApi("/admin/partner-sites", { accessToken });
      if (result.error) {
        throw new Error(errorText(result.error, "Unable to load partner sites."));
      }
      return result.data?.sites ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ businessId, domain, generateKey }) => {
      const result = await fetchApi(`/admin/partner-sites/${businessId}`, {
        method: "PATCH",
        accessToken,
        body: JSON.stringify({ domain, generateKey }),
      });
      if (result.error) return result;
      return result;
    },
    onSuccess: (result) => {
      if (result?.error || !result?.data?.site) return;
      queryClient.setQueryData(["partner-sites"], (current) =>
        (current ?? []).map((site) =>
          site.businessId === result.data.site.businessId ? result.data.site : site
        )
      );
    },
  });

  async function onSave(site, values) {
    setSavingId(site.businessId);
    try {
      return await saveMutation.mutateAsync({
        businessId: site.businessId,
        ...values,
      });
    } finally {
      setSavingId("");
    }
  }

  if (!isReady || !accessToken) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Partner Sites</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {TAB_COPY[activeTab]}
        </p>
      </div>
      <PartnerSiteTabs
        value={activeTab}
        onValueChange={(tabId) => {
          const option = PARTNER_TABS.find((tab) => tab.id === tabId);
          if (option) query.setField("tab", option);
        }}
      />
      {activeTab === "leads" || activeTab === "reviews" ? (
        <PartnerSiteMessageList
          kind={activeTab}
          page={query.page}
          search={query.q}
          accessToken={accessToken}
          onPageChange={(nextPage) => query.setField("page", nextPage)}
          onSearchChange={(value) => query.setField("q", value)}
        />
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading partner sites.</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <div className={`rounded-lg border border-border ${isFetching ? "opacity-70" : ""}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Notification email</TableHead>
                <TableHead>Website intake</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Allowed origins</TableHead>
                <TableHead>API key</TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground">
                    No partner listings yet.
                  </TableCell>
                </TableRow>
              ) : (
                (data ?? []).map((site) => (
                  <PartnerSiteRow
                    key={site.businessId}
                    site={site}
                    saving={savingId === site.businessId}
                    onSave={(values) => onSave(site, values)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
