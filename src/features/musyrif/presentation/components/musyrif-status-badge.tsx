import { Badge } from "@/components/ui/badge";
import type { MusyrifPerijinanStatus } from "../../domain/musyrif-types";

const statusClass: Record<MusyrifPerijinanStatus, string> = {
  draft: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  check: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  approve: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  reject: "bg-red-100 text-red-700 hover:bg-red-100",
  keluar: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  kembali: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  selesai: "bg-green-100 text-green-700 hover:bg-green-100",
};

export function MusyrifStatusBadge({ status, label }: { status: MusyrifPerijinanStatus; label?: string }) {
  return <Badge className={statusClass[status]}>{label || status}</Badge>;
}
