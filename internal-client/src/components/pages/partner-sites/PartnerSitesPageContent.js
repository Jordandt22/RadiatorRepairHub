"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, PencilIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function PartnerSiteRow({ site, onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [domain, setDomain] = useState(site.domain || "");
  const [error, setError] = useState("");
  const [keyError, setKeyError] = useState("");

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

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["partner-sites"],
    enabled: Boolean(isReady && accessToken),
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
          Save the shop domain and copy the API key into that website&apos;s env file.
          Allowed origins are the https hosts the form may send from.
        </p>
      </div>
      {isLoading ? (
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
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
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
