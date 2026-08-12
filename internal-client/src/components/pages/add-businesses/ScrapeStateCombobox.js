"use client";

import { useId } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function ScrapeStateCombobox({
  states = [],
  value = null,
  onValueChange,
  disabled = false,
  invalid = false,
}) {
  const inputId = useId();

  return (
    <Combobox
      items={states}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(state) => (state ? state.name : "")}
      itemToStringValue={(state) => state?.id ?? ""}
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder="Select state"
        aria-label="State"
        aria-invalid={invalid || undefined}
        disabled={disabled}
        autoComplete="off"
        name={`rrh-scrape-state-${inputId}`}
        id={`rrh-scrape-state-${inputId}`}
        className="w-full min-w-0"
      />
      <ComboboxContent className="rounded-lg">
        <ComboboxEmpty>No states found.</ComboboxEmpty>
        <ComboboxList>
          {(state) => (
            <ComboboxItem key={state.id} value={state}>
              <span className="truncate">{state.name}</span>
              <span className="text-muted-foreground">{state.code}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
