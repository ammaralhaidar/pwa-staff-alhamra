import { Badge } from "@/components/ui/badge";
import type { PelanggaranStatus } from "../../domain/pelanggaran-types";

const statusClass: Record<PelanggaranStatus, string> = {
  draft: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-0 rounded-full px-3 py-1",
  proses: "bg-[#F3E8FF] text-[#9333EA] hover:bg-[#F3E8FF] border-0 rounded-full px-3 py-1 text-xs font-medium lowercase",
  validasi: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 rounded-full px-3 py-1 text-xs font-medium lowercase",
  selesai: "bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7] border-0 rounded-full px-3 py-1 text-xs font-medium lowercase",
  batal: "bg-red-100 text-red-700 hover:bg-red-100 border-0 rounded-full px-3 py-1 text-xs font-medium lowercase",
};

export function PelanggaranStatusBadge({ status, label }: { status: PelanggaranStatus; label?: string }) {
  return (
    <Badge className={`${statusClass[status]} shadow-none capitalize font-semibold`}>
      {label || status}
    </Badge>
  );
}
