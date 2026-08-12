"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/api/fetchApi";
import ScrapeCityRow from "@/components/pages/add-businesses/ScrapeCityRow";
import {
  isScrapeCityRowValid,
  parseScrapeCities,
} from "@/components/pages/add-businesses/scrapeCities";

const DEFAULT_KEYWORD = "radiator repair";
const MIN_PLACES = 10;
const MAX_PLACES = 200;
const DEFAULT_PLACES = 100;
const MAX_CITIES = 50;

const PLACEHOLDER = `Little Rock, Arkansas
Fayetteville, Arkansas
Washington, DC`;

export default function ScrapeCitiesDialog({
  open,
  onOpenChange,
  onSubmit,
  submitPending = false,
  submitError = null,
}) {
  const [step, setStep] = useState("paste");
  const [text, setText] = useState("");
  const [rows, setRows] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(DEFAULT_KEYWORD);
  const [maxPlaces, setMaxPlaces] = useState(DEFAULT_PLACES);
  const [parseError, setParseError] = useState(null);

  const statesQuery = useQuery({
    queryKey: ["location-states"],
    enabled: open,
    staleTime: 60 * 60_000,
    queryFn: async () => {
      const result = await fetchApi("/location/states");
      if (result.error) {
        throw new Error(result.error.message || "Failed to load states");
      }
      return result.data;
    },
  });

  const states = useMemo(() => statesQuery.data ?? [], [statesQuery.data]);

  useEffect(() => {
    if (open) return;
    setStep("paste");
    setText("");
    setRows([]);
    setSearchKeyword(DEFAULT_KEYWORD);
    setMaxPlaces(DEFAULT_PLACES);
    setParseError(null);
  }, [open]);

  const lineCount = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

  const invalidCount = rows.filter((row) => !isScrapeCityRowValid(row)).length;
  const canSubmit =
    rows.length > 0 &&
    invalidCount === 0 &&
    rows.length <= MAX_CITIES &&
    searchKeyword.trim().length > 0;

  const handleNext = () => {
    const { rows: parsed } = parseScrapeCities(text, states);
    if (parsed.length === 0) {
      setParseError("Add at least one city.");
      return;
    }
    if (parsed.length > MAX_CITIES) {
      setParseError(`At most ${MAX_CITIES} cities can be scraped at once.`);
      return;
    }
    setParseError(null);
    setRows(parsed);
    setStep("review");
  };

  const updateRow = (key, patch) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const ok = await onSubmit({
      search_keyword: searchKeyword.trim(),
      max_places: maxPlaces,
      cities: rows.map((row) => ({
        city: row.city.trim(),
        state_id: row.state.id,
      })),
    });
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className={step === "paste" ? "sm:max-w-md" : "sm:max-w-2xl"}
        showCloseButton={!submitPending}
      >
        <DialogHeader>
          <DialogTitle>
            {step === "paste" ? "Paste cities" : "Review & configure"}
          </DialogTitle>
          <DialogDescription>
            {step === "paste"
              ? "One city per line, formatted as City, State. Each city becomes its own ingest group."
              : "Confirm each city and state, then set the search keyword and place limit."}
          </DialogDescription>
        </DialogHeader>

        {step === "paste" ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="scrape-cities-text">Cities</Label>
              <Textarea
                id="scrape-cities-text"
                value={text}
                rows={10}
                autoFocus
                placeholder={PLACEHOLDER}
                className="min-h-52 font-mono"
                onChange={(event) => {
                  setText(event.target.value);
                  if (parseError) setParseError(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                {lineCount} {lineCount === 1 ? "line" : "lines"} detected
              </p>
            </div>

            {statesQuery.isError ? (
              <p className="text-sm text-destructive">
                Failed to load states. Close and try again.
              </p>
            ) : null}
            {parseError ? (
              <p className="text-sm text-destructive">{parseError}</p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={lineCount === 0 || statesQuery.isLoading}
                onClick={handleNext}
              >
                Next
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="scrape-keyword">Search keyword</Label>
                <Input
                  id="scrape-keyword"
                  value={searchKeyword}
                  disabled={submitPending}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="scrape-max-places">Max places per city</Label>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {maxPlaces}
                  </span>
                </div>
                <input
                  id="scrape-max-places"
                  type="range"
                  min={MIN_PLACES}
                  max={MAX_PLACES}
                  step={10}
                  value={maxPlaces}
                  disabled={submitPending}
                  onChange={(event) => setMaxPlaces(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-foreground disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{MIN_PLACES}</span>
                  <span>{MAX_PLACES}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Cities</Label>
                <span className="text-xs text-muted-foreground">
                  {rows.length} {rows.length === 1 ? "city" : "cities"} · up to{" "}
                  {maxPlaces} places each
                </span>
              </div>
              <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
                {rows.map((row) => (
                  <ScrapeCityRow
                    key={row.key}
                    row={row}
                    states={states}
                    disabled={submitPending}
                    onCityChange={(city) => updateRow(row.key, { city })}
                    onStateChange={(state) => updateRow(row.key, { state })}
                    onRemove={() =>
                      setRows((prev) =>
                        prev.filter((item) => item.key !== row.key)
                      )
                    }
                  />
                ))}
              </div>
              {invalidCount > 0 ? (
                <p className="text-xs text-destructive">
                  {invalidCount}{" "}
                  {invalidCount === 1 ? "row needs" : "rows need"} a city and a
                  valid state.
                </p>
              ) : null}
            </div>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={submitPending}
                onClick={() => setStep("paste")}
              >
                Back
              </Button>
              <Button type="submit" disabled={submitPending || !canSubmit}>
                {submitPending ? "Starting…" : "Start scrape"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
