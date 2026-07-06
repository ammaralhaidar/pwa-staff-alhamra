import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { TimepickerUI } from "timepicker-ui";
import "timepicker-ui/main.css";

type MusyrifTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function normalizeTime(hour?: string, minutes?: string) {
  const normalizedHour = String(hour ?? "00").padStart(2, "0");
  const normalizedMinutes = String(minutes ?? "00").padStart(2, "0");
  return `${normalizedHour}:${normalizedMinutes}`;
}

export function MusyrifTimePicker({ value, onChange }: MusyrifTimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<TimepickerUI | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) return;

    const picker = new TimepickerUI(inputRef.current, {
      clock: {
        type: "24h",
        incrementHours: 1,
        incrementMinutes: 5,
        autoSwitchToMinutes: true,
      },
      ui: {
        mode: "clock",
        theme: "basic",
        mobile: true,
        animation: true,
        backdrop: true,
        editable: false,
        enableSwitchIcon: true,
      },
      labels: {
        time: "Pilih Jam",
        mobileTime: "Pilih Jam",
        mobileHour: "Jam",
        mobileMinute: "Menit",
        cancel: "Batal",
        ok: "OK",
        format24Label: "24 jam",
      },
      behavior: {
        focusInputAfterClose: false,
      },
      callbacks: {
        onConfirm: (data) => {
          onChangeRef.current(normalizeTime(data.hour, data.minutes));
        },
      },
    });

    picker.create();
    pickerRef.current = picker;

    return () => {
      picker.destroy({ keepInputValue: true });
      pickerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value}
        placeholder="Pilih jam"
        onChange={() => undefined}
        onClick={() => pickerRef.current?.open()}
        className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
