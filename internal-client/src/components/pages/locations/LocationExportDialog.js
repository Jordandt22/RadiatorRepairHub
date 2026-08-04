"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, LoaderCircleIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

function exportMeta(mode, { stateLabel, cityLabel }) {
  if (mode === "postal-codes") {
    return {
      title: `Postal code stats${cityLabel ? ` — ${cityLabel}` : ""}`,
      description:
        "Plain-text postal code stats for the selected city, ready to paste into Claude.",
    };
  }
  if (mode === "cities") {
    return {
      title: `City stats${stateLabel ? ` — ${stateLabel}` : ""}`,
      description:
        "Plain-text city stats for the selected state, ready to paste into Claude.",
    };
  }
  return {
    title: "State stats",
    description:
      "Plain-text stats for all states, ready to paste into Claude.",
  };
}

export default function LocationExportDialog({
  open = false,
  onOpenChange,
  mode = "states",
  sort = "businesses_desc",
  stateId = null,
  stateLabel = null,
  cityId = null,
  cityLabel = null,
}) {
  const { accessToken, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const exportQuery = useQuery({
    queryKey: ["admin-locations-export", mode, sort, stateId, cityId],
    queryFn: async () => {
      const params = new URLSearchParams({ sort });
      let path = "/admin/locations/export/states";

      if (mode === "cities") {
        if (!stateId) {
          throw new Error("Select a state to export cities.");
        }
        path = "/admin/locations/export/cities";
        params.set("state_id", stateId);
      } else if (mode === "postal-codes") {
        if (!cityId) {
          throw new Error("Select a city to export postal codes.");
        }
        path = "/admin/locations/export/postal-codes";
        params.set("city_id", cityId);
      }

      const result = await fetchApi(`${path}?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to export location stats",
        );
      }
      return result.data;
    },
    enabled:
      open &&
      !!accessToken &&
      (mode === "states" ||
        (mode === "cities" && !!stateId) ||
        (mode === "postal-codes" && !!cityId)),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const text = exportQuery.data?.text ?? "";
  const { title, description } = exportMeta(mode, { stateLabel, cityLabel });

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {exportQuery.isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Loading export…
          </div>
        ) : exportQuery.error ? (
          <p className="text-sm text-destructive">
            {exportQuery.error.message || "Failed to load export."}
          </p>
        ) : (
          <Textarea
            value={text}
            readOnly
            rows={18}
            className="min-h-64 resize-y font-mono text-xs leading-relaxed"
            aria-label="Location stats export text"
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
          <Button
            type="button"
            disabled={!text || exportQuery.isLoading}
            onClick={handleCopy}
            className="cursor-pointer"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
