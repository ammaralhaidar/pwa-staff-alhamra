import { AlertTriangle, FileText, UserRound, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Pelanggaran } from "../../domain/kesantrian-types";
import { StatusBadge } from "./status-badge";

type Props = {
  item: Pelanggaran;
  onClick: () => void;
};

export function PelanggaranCard({ item, onClick }: Props) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => event.key === "Enter" && onClick()}
      className="cursor-pointer rounded-3xl border-slate-100/80 bg-white shadow-sm hover:shadow-md transition duration-200 active:scale-[0.99] overflow-hidden"
    >
      <CardContent className="p-4 flex gap-4 items-start">
        {/* Left Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <UserRound className="h-6 w-6" />
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-slate-800 leading-tight truncate">{item.namaSantri}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.kelasSantri || "-"}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <StatusBadge status={item.status} label={item.statusLabel} />
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-1.5 text-xs text-slate-500 font-medium pt-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{item.reference}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">Pelanggaran: {item.namaPelanggaran || "-"}</span>
            </div>
            <div className="pt-0.5">
              <span className="font-bold text-[#E11D48] text-sm">Poin: {item.poin ?? 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

