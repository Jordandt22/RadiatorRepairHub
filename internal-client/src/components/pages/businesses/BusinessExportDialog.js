"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import {
  downloadApi,
  triggerBlobDownload,
} from "@/lib/api/downloadApi";
import {
  BUSINESS_EXPORT_FIELDS,
  BUSINESS_EXPORT_STATS_RANGES,
  DEFAULT_BUSINESS_EXPORT_STATS_RANGE,
  buildBusinessExportFilename,
  fieldsIncludeStats,
  getDefaultBusinessExportFields,
} from "@/lib/businessExport";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";

function buildExportBody({
  filters,
  fields,
  statsRange,
  filename,
  includeStats,
}) {
  const body = {
    fields,
    filename,
  };

  if (filters?.q) body.q = filters.q;
  if (filters?.claimed === true) body.claimed = true;
  if (filters?.featured === true) body.featured = true;
  if (filters?.recent === true) body.recent = true;
  if (filters?.stateCode) body.state_code = filters.stateCode;
  if (filters?.citySlug) body.city_slug = filters.citySlug;
  if (filters?.postalCode) body.postal_code = filters.postalCode;
  if (filters?.scoreTier) body.score_tier = filters.scoreTier;
  if (filters?.reviewsTier) body.reviews_tier = filters.reviewsTier;
  if (filters?.emailFilter) body.email_filter = filters.emailFilter;
  if (filters?.websiteFilter) body.website_filter = filters.websiteFilter;
  if (includeStats) body.stats_range = statsRange;

  return body;
}

export default function BusinessExportDialog({
  open = false,
  onOpenChange,
  source = "businesses",
  filters = {},
}) {
  const { accessToken, logout } = useAuth();
  const [selectedFields, setSelectedFields] = useState(() =>
    getDefaultBusinessExportFields(),
  );
  const [statsRange, setStatsRange] = useState(
    DEFAULT_BUSINESS_EXPORT_STATS_RANGE,
  );
  const [filename, setFilename] = useState("businesses.csv");
  const [filenameTouched, setFilenameTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const includeStats = fieldsIncludeStats(selectedFields);

  const defaultFilename = useMemo(
    () =>
      buildBusinessExportFilename({
        source,
        claimed: filters.claimed === true,
        featured: filters.featured === true,
        recent: filters.recent === true,
        websiteFilter: filters.websiteFilter ?? null,
        emailFilter: filters.emailFilter ?? null,
        scoreTier: filters.scoreTier ?? null,
        reviewsTier: filters.reviewsTier ?? null,
        stateCode: filters.stateCode ?? null,
        citySlug: filters.citySlug ?? null,
        postalCode: filters.postalCode ?? null,
        q: filters.q ?? null,
        statsRange: includeStats ? statsRange : null,
        includeStats,
      }),
    [source, filters, includeStats, statsRange],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedFields(getDefaultBusinessExportFields());
    setStatsRange(DEFAULT_BUSINESS_EXPORT_STATS_RANGE);
    setFilenameTouched(false);
    setError(null);
    setPending(false);
  }, [open]);

  useEffect(() => {
    if (!open || filenameTouched) return;
    setFilename(defaultFilename);
  }, [open, defaultFilename, filenameTouched]);

  const toggleField = (fieldId, checked) => {
    setSelectedFields((prev) => {
      if (checked) {
        if (prev.includes(fieldId)) return prev;
        return [...prev, fieldId];
      }
      return prev.filter((id) => id !== fieldId);
    });
  };

  const handleExport = async () => {
    if (!accessToken || selectedFields.length === 0) return;
    setPending(true);
    setError(null);

    const result = await downloadApi("/admin/businesses/export", {
      method: "POST",
      accessToken,
      filename: filename || defaultFilename,
      body: JSON.stringify(
        buildExportBody({
          filters,
          fields: selectedFields,
          statsRange,
          filename: filename || defaultFilename,
          includeStats,
        }),
      ),
    });

    setPending(false);

    if (result.status === 401) {
      logout();
      setError("Session expired");
      return;
    }

    if (result.error || !result.blob) {
      setError(result.error?.message || "Failed to export businesses");
      return;
    }

    triggerBlobDownload(result.blob, result.filename || filename);
    onOpenChange?.(false);
  };

  const contactFields = BUSINESS_EXPORT_FIELDS.filter((field) => !field.stats);
  const statsFields = BUSINESS_EXPORT_FIELDS.filter((field) => field.stats);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export businesses</DialogTitle>
          <DialogDescription>
            Download a CSV of the current filtered businesses. Choose a filename
            and the columns to include.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-2">
          <div className="space-y-2">
            <Label htmlFor="business-export-filename">File name</Label>
            <Input
              id="business-export-filename"
              value={filename}
              onChange={(event) => {
                setFilenameTouched(true);
                setFilename(event.target.value);
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Columns</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 cursor-pointer bg-gray-100 px-2 text-xs hover:bg-gray-200"
                  onClick={() =>
                    setSelectedFields(BUSINESS_EXPORT_FIELDS.map((f) => f.id))
                  }
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 cursor-pointer bg-gray-100 px-2 text-xs hover:bg-gray-200"
                  onClick={() => setSelectedFields(getDefaultBusinessExportFields())}
                >
                  Defaults
                </Button>
              </div>
            </div>

            <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
              {contactFields.map((field) => {
                const checked = selectedFields.includes(field.id);
                return (
                  <label
                    key={field.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        toggleField(field.id, next === true)
                      }
                      aria-label={field.label}
                    />
                    <span>{field.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Stats</p>
              <div className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                {statsFields.map((field) => {
                  const checked = selectedFields.includes(field.id);
                  return (
                    <label
                      key={field.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) =>
                          toggleField(field.id, next === true)
                        }
                        aria-label={field.label}
                      />
                      <span>{field.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {includeStats ? (
            <div className="space-y-2">
              <Label>Stats range</Label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_EXPORT_STATS_RANGES.map((range) => {
                  const active = statsRange === range.id;
                  return (
                    <Button
                      key={range.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className={cn(
                        "rounded-full",
                        !active && "hover:bg-gray-100",
                      )}
                      onClick={() => setStatsRange(range.id)}
                    >
                      {range.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={pending || selectedFields.length === 0}
          >
            {pending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Exporting…
              </>
            ) : (
              "Export CSV"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
