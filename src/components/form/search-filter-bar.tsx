import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilterBar({ value, onChange, placeholder = "Cari data...", className }: SearchFilterBarProps) {
  return (
    <label className={cn("flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm", className)}>
      <Search className="h-5 w-5 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
