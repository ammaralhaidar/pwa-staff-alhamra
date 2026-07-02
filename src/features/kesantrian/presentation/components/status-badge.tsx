import { Badge } from "@/components/ui/badge";
import type { PelanggaranStatus, PerijinanStatus } from "../../domain/kesantrian-types";

type Props = {
  status: PerijinanStatus | PelanggaranStatus;
  label: string;
};

const colorMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  check: "bg-amber-50 text-amber-700",
  approve: "bg-emerald-50 text-emerald-700",
  reject: "bg-rose-50 text-rose-700",
  keluar: "bg-purple-50 text-purple-700",
  kembali: "bg-emerald-50 text-emerald-700",
  selesai: "bg-emerald-50 text-emerald-700",
  proses: "bg-blue-50 text-blue-700",
  validasi: "bg-amber-50 text-amber-700",
  batal: "bg-rose-50 text-rose-700",
};

export function StatusBadge({ status, label }: Props) {
  return (
    <Badge className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${colorMap[status] ?? colorMap.draft}`}>
      {label}
    </Badge>
  );
}
