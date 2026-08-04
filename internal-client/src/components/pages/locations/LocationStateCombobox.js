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

export default function LocationStateCombobox({
  states = [],
  value = null,
  onValueChange,
  disabled = false,
}) {
  const inputId = useId();

  return (
    <Combobox
      items={states}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(state) =>
        state ? `${state.name} (${state.code})` : ""
      }
      itemToStringValue={(state) => state?.id ?? ""}
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder="All states"
        aria-label="Filter by state"
        showClear={Boolean(value)}
        disabled={disabled}
        autoComplete="off"
        name={`rrh-state-filter-${inputId}`}
        id={`rrh-state-filter-${inputId}`}
        className="w-full min-w-0 md:min-w-[12rem]"
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
