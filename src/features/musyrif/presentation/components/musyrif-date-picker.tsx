import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseDateInput(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDateInput(value);
  if (!date) return "Pilih tanggal";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

type MusyrifDatePickerProps = {
  value: string;
  min?: string;
  onChange: (value: string) => void;
};

export function MusyrifDatePicker({ value, min, onChange }: MusyrifDatePickerProps) {
  const selectedDate = parseDateInput(value);
  const minDate = parseDateInput(min ?? "");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-between rounded-xl border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-none hover:bg-white"
        >
          <span className="truncate">{formatDisplayDate(value)}</span>
          <CalendarDays className="size-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-[22px] bg-white p-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          disabled={minDate ? { before: minDate } : undefined}
          onSelect={(date) => {
            if (date) onChange(formatDateInput(date));
          }}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
