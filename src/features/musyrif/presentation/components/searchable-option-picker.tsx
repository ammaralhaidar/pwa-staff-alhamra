import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type SearchableOption = {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
};

type SearchableOptionPickerProps = {
  label?: string;
  value: string;
  placeholder: string;
  searchPlaceholder?: string;
  title: string;
  description?: string;
  options: SearchableOption[];
  disabled?: boolean;
  emptyLabel?: string;
  onChange: (value: string) => void;
};

export function SearchableOptionPicker({
  label,
  value,
  placeholder,
  searchPlaceholder = "Cari data...",
  title,
  description,
  options,
  disabled,
  emptyLabel = "Data tidak ditemukan.",
  onChange,
}: SearchableOptionPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);
  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) =>
      [option.label, option.subtitle, option.badge].some((item) => item?.toLowerCase().includes(keyword)),
    );
  }, [options, search]);

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      {label ? <label className="block text-[11px] font-bold text-slate-400">{label}</label> : null}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="h-11 w-full justify-between rounded-xl border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-none hover:bg-white disabled:bg-slate-100 disabled:text-slate-400"
      >
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label || placeholder}</span>
        <ChevronDown className="ml-2 size-4 shrink-0 text-slate-400" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[82svh] max-w-[390px] overflow-hidden rounded-[24px] bg-white p-0">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="text-base font-bold text-slate-900">{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div className="px-5">
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
              <Search className="size-4 shrink-0 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="max-h-[56svh] overflow-y-auto px-5 pb-5 pt-3">
            <div className="flex flex-col gap-2">
              {filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectOption(option.value)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      {option.label.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{option.label}</p>
                      {option.subtitle ? <p className="truncate text-xs font-medium text-slate-400">{option.subtitle}</p> : null}
                    </div>
                    {option.badge ? (
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">
                        {option.badge}
                      </span>
                    ) : null}
                    {isSelected ? <Check className="size-4 shrink-0 text-blue-600" /> : null}
                  </button>
                );
              })}
              {!filteredOptions.length ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-400">
                  {emptyLabel}
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
