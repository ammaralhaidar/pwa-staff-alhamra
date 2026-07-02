import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TindakanOption } from "../../domain/kesantrian-types";

type Props = {
  value?: number;
  options: TindakanOption[];
  disabled?: boolean;
  onChange: (id: number) => void;
};

export function TindakanPicker({ value, options, disabled, onChange }: Props) {
  return (
    <Select
      value={value ? String(value) : ""}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
    >
      <SelectTrigger className="h-11 w-full rounded-2xl border-blue-100 bg-white">
        <SelectValue placeholder="Pilih tindakan" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
