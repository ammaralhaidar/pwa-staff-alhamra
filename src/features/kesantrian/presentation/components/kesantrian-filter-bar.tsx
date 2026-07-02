import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeRangeFilter } from "../../domain/kesantrian-types";

type StatusOption = {
  value: string;
  label: string;
};

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  timeRange: TimeRangeFilter;
  onTimeRangeChange: (value: TimeRangeFilter) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
};

const timeOptions: { value: TimeRangeFilter; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "7days", label: "7 Hari" },
  { value: "30days", label: "30 Hari" },
  { value: "all", label: "Semua" },
];

export function KesantrianFilterBar({
  search,
  onSearchChange,
  timeRange,
  onTimeRangeChange,
  status,
  onStatusChange,
  statusOptions,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nama atau nomor referensi"
          className="h-11 rounded-2xl border-blue-100 bg-white pl-9 shadow-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select value={timeRange} onValueChange={(value) => onTimeRangeChange(value as TimeRangeFilter)}>
          <SelectTrigger className="h-11 w-full rounded-2xl border-blue-100 bg-white">
            <SelectValue placeholder="Rentang waktu" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-11 w-full rounded-2xl border-blue-100 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
