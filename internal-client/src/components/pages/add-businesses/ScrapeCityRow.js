"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrapeStateCombobox from "@/components/pages/add-businesses/ScrapeStateCombobox";

export default function ScrapeCityRow({
  row,
  states,
  disabled = false,
  onCityChange,
  onStateChange,
  onRemove,
}) {
  const cityMissing = !row.city.trim();
  const stateMissing = !row.state?.id;

  return (
    <div className="flex items-start gap-2">
      <Input
        value={row.city}
        disabled={disabled}
        placeholder="City"
        aria-label="City"
        aria-invalid={cityMissing || undefined}
        onChange={(event) => onCityChange(event.target.value)}
        className="flex-1"
      />
      <div className="flex-1">
        <ScrapeStateCombobox
          states={states}
          value={row.state}
          disabled={disabled}
          invalid={stateMissing}
          onValueChange={onStateChange}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        aria-label={`Remove ${row.city || "city"}`}
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <XIcon />
      </Button>
    </div>
  );
}
