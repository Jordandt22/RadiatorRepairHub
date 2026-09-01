"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function SelectMenu({
  id,
  label,
  value,
  onValueChange,
  options,
  className,
  triggerClassName,
  contentClassName,
  "aria-label": ariaLabel,
  disabled = false,
}) {
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          id={id}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          className={cn(
            "flex h-9 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none ring-3 ring-transparent transition-all duration-200 hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:border-ring data-popup-open:ring-ring/30",
            triggerClassName
          )}
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className={cn(
            "max-h-60 w-(--anchor-width) min-w-(--anchor-width)",
            contentClassName
          )}
        >
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className={cn(
                  "cursor-pointer",
                  option.value === value && "bg-tint text-primary"
                )}
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { SelectMenu };
