"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

export interface MultiSelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  id?: string;
  label?: string;
  maxChips?: number;
}

/**
 * Searchable multi-select dropdown with checkmarks and removable chips.
 * Used for accommodation filters — keyboard navigable via command list.
 */
function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select filters",
  searchPlaceholder = "Search…",
  emptyText = "No matches found.",
  className,
  id,
  label,
  maxChips = 2
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const visibleChips = selected.slice(0, maxChips);
  const overflow = selected.length - visibleChips.length;

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label ?? placeholder}
            className="h-auto min-h-9 w-full justify-between py-1.5 font-normal"
          >
            <span className="flex flex-wrap items-center gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {visibleChips.map((v) => {
                    const opt = options.find((o) => o.value === v);
                    return (
                      <Badge key={v} variant="secondary" className="gap-1 pr-1 text-[11px]">
                        {opt?.label ?? v}
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Remove ${opt?.label ?? v}`}
                          className="cursor-pointer rounded-full p-0.5 hover:bg-muted-foreground/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(v);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              toggle(v);
                            }
                          }}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </span>
                      </Badge>
                    );
                  })}
                  {overflow > 0 && (
                    <Badge variant="outline" className="text-[11px]">
                      +{overflow} more
                    </Badge>
                  )}
                </>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const active = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.hint ?? ""}`}
                      onSelect={() => toggle(option.value)}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          active ? "border-sky-600 bg-sky-600 text-white" : "border-input"
                        )}
                        aria-hidden="true"
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="truncate">{option.label}</span>
                      {option.hint && (
                        <span className="ml-auto truncate text-xs text-muted-foreground">{option.hint}</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          {selected.length > 0 && (
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onChange([])}>
                Clear all ({selected.length})
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { MultiSelect };
