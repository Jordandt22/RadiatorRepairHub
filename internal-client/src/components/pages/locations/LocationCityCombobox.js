"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function LocationCityCombobox({
  cities = [],
  value = null,
  onValueChange,
  disabled = false,
}) {
  return (
    <Combobox
      items={cities}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(city) =>
        city
          ? `${city.name}${city.state_code ? ` (${city.state_code})` : ""}`
          : ""
      }
      itemToStringValue={(city) => city?.id ?? ""}
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder="All cities"
        aria-label="Filter by city"
        showClear={Boolean(value)}
        disabled={disabled}
        className="w-full min-w-0 md:min-w-[14rem]"
      />
      <ComboboxContent className="rounded-lg">
        <ComboboxEmpty>No cities found.</ComboboxEmpty>
        <ComboboxList>
          {(city) => (
            <ComboboxItem key={city.id} value={city}>
              <span className="truncate">{city.name}</span>
              {city.state_code ? (
                <span className="text-muted-foreground">{city.state_code}</span>
              ) : null}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
