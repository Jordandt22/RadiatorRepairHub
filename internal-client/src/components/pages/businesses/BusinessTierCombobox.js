"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function BusinessTierCombobox({
  items = [],
  value = null,
  onValueChange,
  placeholder = "All",
  ariaLabel = "Filter",
  disabled = false,
  className,
}) {
  return (
    <Combobox
      items={items}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(item) => item?.label ?? ""}
      itemToStringValue={(item) => item?.id ?? ""}
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        aria-label={ariaLabel}
        showClear={Boolean(value)}
        disabled={disabled}
        autoComplete="off"
        name={`filter-${ariaLabel.replace(/\s+/g, "-").toLowerCase()}`}
        className={className ?? "w-full min-w-0 md:min-w-[10rem]"}
      />
      <ComboboxContent className="rounded-lg">
        <ComboboxEmpty>No options found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              <span className="truncate">{item.label}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
